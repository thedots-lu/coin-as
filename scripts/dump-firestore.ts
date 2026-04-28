/**
 * Dump every Firestore collection used by the app into a local JSON folder.
 *
 *   npm run dump-firestore             # dumps to dumps/{timestamp}/
 *   npm run dump-firestore -- --out my-folder    # custom folder
 *
 * Output structure:
 *   dumps/2026-04-28T15-30-00/
 *     _metadata.json              (project, timestamp, per-collection counts)
 *     articles.json               (array of { id, ...data })
 *     pages.json
 *     ...
 *
 * Firestore Timestamps are converted to { _ts: <epoch_ms> } so a future
 * restore script can reconstruct them faithfully.
 *
 * Env: reads NEXT_PUBLIC_FIREBASE_* from .env.local — same as the seed script.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  Timestamp,
  type Firestore,
} from 'firebase/firestore'

const COLLECTIONS = [
  'site_config',
  'navigation',
  'pages',
  'services',
  'challenges',
  'news',
  'articles',
  'white_papers',
  'faq',
  'partners',
  'team_members',
  'testimonials',
  'customer_logos',
] as const

function getDb(): { db: Firestore; projectId: string } {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set. Check .env.local.')
  }
  const app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  })
  return { db: getFirestore(app), projectId }
}

// Firestore values can be plain objects, arrays, Timestamps, or other special
// types. Convert non-JSON-native values into a tagged shape so they round-trip.
function serialize(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (value instanceof Timestamp) return { _ts: value.toMillis() }
  if (value instanceof Date) return { _ts: value.getTime() }
  if (Array.isArray(value)) return value.map(serialize)
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = serialize(v)
    return out
  }
  return value
}

function getOutDir(): string {
  const flagIndex = process.argv.indexOf('--out')
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) {
    return process.argv[flagIndex + 1]
  }
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return join('dumps', ts)
}

async function dumpCollection(db: Firestore, name: string) {
  const snapshot = await getDocs(collection(db, name))
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...(serialize(d.data()) as object) }))
  return docs
}

async function main() {
  const { db, projectId } = getDb()
  const outDir = getOutDir()
  mkdirSync(outDir, { recursive: true })

  console.log('=== Firestore Dump ===')
  console.log(`Project : ${projectId}`)
  console.log(`Output  : ${outDir}`)
  console.log('')

  const counts: Record<string, number> = {}

  for (const name of COLLECTIONS) {
    process.stdout.write(`  ${name.padEnd(20)} `)
    try {
      const docs = await dumpCollection(db, name)
      writeFileSync(join(outDir, `${name}.json`), JSON.stringify(docs, null, 2))
      counts[name] = docs.length
      console.log(`${docs.length} doc${docs.length === 1 ? '' : 's'}`)
    } catch (err) {
      counts[name] = -1
      console.log(`FAILED: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const metadata = {
    projectId,
    dumpedAt: new Date().toISOString(),
    collections: counts,
    totalDocs: Object.values(counts).filter((n) => n > 0).reduce((a, b) => a + b, 0),
  }
  writeFileSync(join(outDir, '_metadata.json'), JSON.stringify(metadata, null, 2))

  console.log('')
  console.log(`=== Done. ${metadata.totalDocs} docs across ${COLLECTIONS.length} collections. ===`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Dump failed:', err)
  process.exit(1)
})
