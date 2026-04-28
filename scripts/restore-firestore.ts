/**
 * Restore a Firestore dump folder into a TARGET Firebase project.
 *
 *   npm run restore-firestore                       # uses most recent dump folder
 *   npm run restore-firestore -- --dump my-folder   # custom dump folder
 *   npm run restore-firestore -- --wipe             # delete docs in target before writing
 *   npm run restore-firestore -- --dry-run          # preview only, no writes
 *   npm run restore-firestore -- --yes              # skip confirmation prompt
 *
 * Uses firebase-admin with a service account JSON to bypass Firestore rules.
 * Path defaults to .firebase-target-sa.json at project root, override with
 * TARGET_SERVICE_ACCOUNT env var or --sa <path>.
 *
 * Safety rails:
 *  - Refuses to run if target project ID matches the source project ID stored
 *    in _metadata.json — prevents accidentally wiping the source.
 *  - Prints both project IDs and asks for confirmation before any write,
 *    unless --yes is passed.
 *
 * Restores Timestamps from { _ts: <ms> } back to firestore.Timestamp on write.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { initializeApp, cert } from 'firebase-admin/app'
import {
  getFirestore,
  Timestamp,
  type Firestore,
} from 'firebase-admin/firestore'

interface Metadata {
  projectId: string
  dumpedAt: string
  collections: Record<string, number>
  totalDocs: number
}

function getDumpDir(): string {
  const flagIndex = process.argv.indexOf('--dump')
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) {
    return process.argv[flagIndex + 1]
  }
  if (!existsSync('dumps')) {
    throw new Error('No dumps/ folder. Run `npm run dump-firestore` first, or pass --dump.')
  }
  const candidates = readdirSync('dumps')
    .map((n) => ({ name: n, path: join('dumps', n) }))
    .filter((c) => statSync(c.path).isDirectory())
    .sort((a, b) => statSync(b.path).mtimeMs - statSync(a.path).mtimeMs)
  if (candidates.length === 0) throw new Error('No dump folders found under dumps/.')
  return candidates[0].path
}

function getServiceAccountPath(): string {
  const flagIndex = process.argv.indexOf('--sa')
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) return process.argv[flagIndex + 1]
  return process.env.TARGET_SERVICE_ACCOUNT ?? '.firebase-target-sa.json'
}

function getTargetDb(): { db: Firestore; projectId: string } {
  const saPath = getServiceAccountPath()
  if (!existsSync(saPath)) {
    throw new Error(
      `Service account file not found: ${saPath}. Pass --sa <path> or set TARGET_SERVICE_ACCOUNT.`,
    )
  }
  const sa = JSON.parse(readFileSync(saPath, 'utf8'))
  const app = initializeApp(
    {
      credential: cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key,
      }),
      projectId: sa.project_id,
    },
    'target',
  )
  return { db: getFirestore(app), projectId: sa.project_id }
}

// Reverse the serialize() from dump-firestore.ts: { _ts: ms } -> Timestamp.
function deserialize(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map(deserialize)
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>
    if (Object.keys(v).length === 1 && typeof v._ts === 'number') {
      return Timestamp.fromMillis(v._ts)
    }
    const out: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(v)) out[k] = deserialize(val)
    return out
  }
  return value
}

async function wipeCollection(db: Firestore, name: string): Promise<number> {
  const snap = await db.collection(name).get()
  if (snap.empty) return 0
  const docs = snap.docs
  let removed = 0
  for (let i = 0; i < docs.length; i += 400) {
    const batch = db.batch()
    docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref))
    await batch.commit()
    removed += Math.min(400, docs.length - i)
  }
  return removed
}

async function writeCollection(
  db: Firestore,
  name: string,
  docs: Array<Record<string, unknown>>,
): Promise<number> {
  let written = 0
  for (let i = 0; i < docs.length; i += 400) {
    const batch = db.batch()
    for (const d of docs.slice(i, i + 400)) {
      const { id, ...rest } = d
      if (typeof id !== 'string' || !id) {
        throw new Error(`Doc in collection "${name}" has no string id`)
      }
      const data = deserialize(rest) as Record<string, unknown>
      batch.set(db.collection(name).doc(id), data)
    }
    await batch.commit()
    written += Math.min(400, docs.length - i)
  }
  return written
}

async function confirm(prompt: string): Promise<boolean> {
  if (process.argv.includes('--yes')) return true
  const rl = createInterface({ input, output })
  const answer = await rl.question(prompt)
  rl.close()
  return /^y(es)?$/i.test(answer.trim())
}

async function main() {
  const dumpDir = getDumpDir()
  const wipe = process.argv.includes('--wipe')
  const dryRun = process.argv.includes('--dry-run')

  const metaPath = join(dumpDir, '_metadata.json')
  if (!existsSync(metaPath)) {
    throw new Error(`Missing ${metaPath} — is this a valid dump folder?`)
  }
  const metadata = JSON.parse(readFileSync(metaPath, 'utf8')) as Metadata
  const { db: targetDb, projectId: targetProject } = getTargetDb()

  if (targetProject === metadata.projectId) {
    throw new Error(
      `Refusing to restore: target project (${targetProject}) is the same as the dump source. ` +
        'This would wipe and rewrite the source. If intentional, use a different mechanism.',
    )
  }

  console.log('=== Firestore Restore ===')
  console.log(`Source dump   : ${dumpDir}`)
  console.log(`Source project: ${metadata.projectId}  (dumped ${metadata.dumpedAt})`)
  console.log(`Target project: ${targetProject}`)
  console.log(`Mode          : ${dryRun ? 'DRY-RUN (no writes)' : wipe ? 'WIPE + WRITE' : 'WRITE (overwrites by id)'}`)
  console.log('')

  if (!dryRun) {
    const ok = await confirm(`Proceed? (y/N) `)
    if (!ok) {
      console.log('Aborted.')
      process.exit(0)
    }
  }

  const collectionFiles = readdirSync(dumpDir).filter(
    (f) => f.endsWith('.json') && !f.startsWith('_'),
  )

  let totalWritten = 0
  let totalWiped = 0
  for (const file of collectionFiles) {
    const name = file.replace(/\.json$/, '')
    const docs = JSON.parse(readFileSync(join(dumpDir, file), 'utf8')) as Array<Record<string, unknown>>
    process.stdout.write(`  ${name.padEnd(20)} `)
    if (dryRun) {
      console.log(`would write ${docs.length} doc${docs.length === 1 ? '' : 's'}`)
      continue
    }
    try {
      let wiped = 0
      if (wipe) wiped = await wipeCollection(targetDb, name)
      const written = await writeCollection(targetDb, name, docs)
      totalWiped += wiped
      totalWritten += written
      console.log(`${wipe ? `wiped ${wiped}, ` : ''}wrote ${written}`)
    } catch (err) {
      console.log(`FAILED: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log('')
  if (dryRun) {
    console.log('=== Dry-run complete (no writes) ===')
  } else {
    console.log(`=== Done. ${wipe ? `${totalWiped} wiped, ` : ''}${totalWritten} docs written into ${targetProject} ===`)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error('Restore failed:', err)
  process.exit(1)
})
