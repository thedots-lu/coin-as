/**
 * List Cloudflare R2 objects that are not referenced by any Firestore document
 * and (optionally) delete them.
 *
 *   npm run cleanup-orphans              # dry-run, prints orphans, no writes
 *   npm run cleanup-orphans -- --apply   # actually deletes the orphans
 *
 * Auth:
 *   Firebase: FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY env vars (preferred,
 *   used in CI), or fallback to .firebase-target-sa.json (TARGET_SERVICE_ACCOUNT
 *   to override).
 *   R2: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
 *   R2_PUBLIC_URL env vars.
 *
 * Detection: a referenced URL is any string in any Firestore document that
 * starts with R2_PUBLIC_URL. The corresponding key is the URL minus that prefix.
 *
 * Safety: dry-run by default. Logs the count of objects scanned and orphans
 * found. Will refuse to run if any required env var is missing.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { readFileSync, existsSync } from 'node:fs'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3'

const COLLECTIONS = [
  'site_config',
  'navigation',
  'pages',
  'services',
  'challenges',
  'news',
  'articles',
  'white_papers',
  'faq_items',
  'partners',
  'team_members',
  'testimonials',
  'customer_logos',
]

const APPLY = process.argv.includes('--apply')

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v || !v.trim()) {
    throw new Error(`Missing env var: ${name}`)
  }
  return v
}

function loadFirebaseCredentials(): { projectId: string; clientEmail: string; privateKey: string } {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: requireEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }
  const saPath = process.env.TARGET_SERVICE_ACCOUNT ?? '.firebase-target-sa.json'
  if (!existsSync(saPath)) {
    throw new Error(
      `No Firebase credentials. Set FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY or provide ${saPath}.`,
    )
  }
  const sa = JSON.parse(readFileSync(saPath, 'utf8')) as {
    project_id: string
    client_email: string
    private_key: string
  }
  return { projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key }
}

function walkUrls(value: unknown, out: Set<string>): void {
  if (value == null) return
  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value)) out.add(value)
    return
  }
  if (Array.isArray(value)) {
    for (const v of value) walkUrls(v, out)
    return
  }
  if (typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) walkUrls(v, out)
  }
}

async function main() {
  // Init Firebase (service account)
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadFirebaseCredentials()) })
  }
  const db = getFirestore()

  // Init R2
  const accountId = requireEnv('R2_ACCOUNT_ID')
  const bucket = requireEnv('R2_BUCKET')
  const publicUrlBase = requireEnv('R2_PUBLIC_URL').replace(/\/+$/, '')
  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })

  console.log(`Mode: ${APPLY ? 'APPLY (will delete)' : 'DRY-RUN'}`)
  console.log(`Bucket: ${bucket}`)
  console.log(`Public URL: ${publicUrlBase}`)

  // 1. Collect referenced URLs across all Firestore collections
  const urls = new Set<string>()
  for (const name of COLLECTIONS) {
    const snap = await db.collection(name).get()
    for (const d of snap.docs) walkUrls(d.data(), urls)
    console.log(`  scanned ${name}: ${snap.size} docs`)
  }

  const referencedKeys = new Set<string>()
  for (const u of urls) {
    if (u.startsWith(publicUrlBase + '/')) {
      referencedKeys.add(u.slice(publicUrlBase.length + 1))
    }
  }
  console.log(`Found ${urls.size} URLs in Firestore, ${referencedKeys.size} pointing to this bucket.`)

  // 2. List all R2 objects
  const allKeys: string[] = []
  let continuationToken: string | undefined
  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    )
    for (const obj of res.Contents ?? []) {
      if (obj.Key) allKeys.push(obj.Key)
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (continuationToken)
  console.log(`Bucket holds ${allKeys.length} objects.`)

  // 3. Diff
  const orphans = allKeys.filter((k) => !referencedKeys.has(k))
  console.log(`Orphans: ${orphans.length}`)
  if (orphans.length === 0) {
    console.log('Nothing to do.')
    return
  }

  // 4. Print every orphan; delete if --apply
  for (const k of orphans) console.log(`  - ${k}`)

  if (!APPLY) {
    console.log('\n(dry-run; pass --apply to delete)')
    return
  }

  // R2 supports DeleteObjects with up to 1000 keys per request
  let deleted = 0
  for (let i = 0; i < orphans.length; i += 1000) {
    const batch = orphans.slice(i, i + 1000)
    const res = await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((k) => ({ Key: k })) },
      }),
    )
    deleted += res.Deleted?.length ?? 0
    for (const err of res.Errors ?? []) {
      console.error(`  delete error: ${err.Key}: ${err.Code} ${err.Message}`)
    }
  }
  console.log(`Deleted ${deleted} object(s).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
