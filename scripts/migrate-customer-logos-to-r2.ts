/**
 * Migrate customer logos from local /public/images/customers/* paths to
 * Cloudflare R2.
 *
 * The `customer_logos` Firestore collection is the single source of truth —
 * the homepage Trusted-by marquee and the About page Our-Customers section
 * both read from it at render time. Each doc has `imageUrl: string`.
 *
 * For every imageUrl that starts with `/images/`, this script reads the file
 * from `public/<path>`, uploads it to R2, and rewrites the URL in Firestore.
 *
 * Usage:
 *   npx tsx scripts/migrate-customer-logos-to-r2.ts              # dry-run
 *   npx tsx scripts/migrate-customer-logos-to-r2.ts -- --apply   # actually write
 *
 * Idempotent: entries already on http(s) URLs are skipped.
 *
 * Auth: .firebase-target-sa.json (or TARGET_SERVICE_ACCOUNT env var) — same
 * pattern used by the other migration scripts.
 * R2: R2_ACCOUNT_ID, R2_BUCKET, R2_PUBLIC_URL, R2_ACCESS_KEY_ID,
 *     R2_SECRET_ACCESS_KEY (same env vars as /api/upload).
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const APPLY = process.argv.includes('--apply')

// ---- Helpers ----------------------------------------------------------------

function loadCredentials() {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }
  const saPath = process.env.TARGET_SERVICE_ACCOUNT ?? '.firebase-target-sa.json'
  if (!existsSync(saPath)) throw new Error(`Need ${saPath} or FIREBASE_* env vars.`)
  const sa = JSON.parse(readFileSync(saPath, 'utf8'))
  return { projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key }
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

function mimeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  return (
    {
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    } as Record<string, string>
  )[ext] ?? 'application/octet-stream'
}

interface R2Context {
  s3: S3Client
  bucket: string
  publicUrlBase: string
}

/**
 * Upload one local /images/... URL to R2 under the given key prefix and return
 * the public R2 URL. Returns the original URL unchanged if it's already remote
 * or the file is missing on disk.
 */
async function migrateOne(
  ctx: R2Context,
  url: string,
  keyPrefix: string,
): Promise<{ next: string; uploaded: boolean; reason?: string }> {
  if (!url) return { next: url, uploaded: false, reason: 'empty' }
  if (/^https?:\/\//i.test(url)) {
    return { next: url, uploaded: false, reason: 'already remote' }
  }
  if (!url.startsWith('/')) {
    return { next: url, uploaded: false, reason: `unexpected URL shape (${url})` }
  }

  const localPath = path.join(process.cwd(), 'public', url.replace(/^\/+/, ''))
  if (!existsSync(localPath)) {
    return { next: url, uploaded: false, reason: `local file missing at ${localPath}` }
  }

  const filename = path.basename(localPath)
  const safe = filename.replace(/[^a-zA-Z0-9._-]+/g, '-')
  const key = `${keyPrefix}/${safe}`
  const finalUrl = `${ctx.publicUrlBase}/${key}`

  if (APPLY) {
    const body = readFileSync(localPath)
    await ctx.s3.send(
      new PutObjectCommand({
        Bucket: ctx.bucket,
        Key: key,
        Body: body,
        ContentType: mimeFor(filename),
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )
  }

  return { next: finalUrl, uploaded: true }
}

// ---- Migrators --------------------------------------------------------------

interface CustomerLogoDoc {
  imageUrl?: string
  name?: string
  [k: string]: unknown
}

async function migrateCustomerLogosCollection(
  db: FirebaseFirestore.Firestore,
  r2: R2Context,
): Promise<{ scanned: number; uploaded: number; updated: number; skipped: number }> {
  console.log('\n--- customer_logos collection ---')
  const snap = await db.collection('customer_logos').get()
  if (snap.empty) {
    console.log('  (collection is empty)')
    return { scanned: 0, uploaded: 0, updated: 0, skipped: 0 }
  }

  let uploaded = 0
  let updated = 0
  let skipped = 0
  for (const d of snap.docs) {
    const data = d.data() as CustomerLogoDoc
    const url = data.imageUrl ?? ''
    const result = await migrateOne(r2, url, `customer_logos/${d.id}`)
    if (!result.uploaded) {
      console.log(`  ${d.id} (${data.name ?? '?'}): skip — ${result.reason}`)
      skipped++
      continue
    }
    console.log(`  ${d.id} (${data.name ?? '?'}): ${url} → ${result.next}`)
    uploaded++
    if (APPLY) {
      await d.ref.update({ imageUrl: result.next, updatedAt: Timestamp.now() })
      updated++
    }
  }
  return { scanned: snap.size, uploaded, updated, skipped }
}

// ---- Main -------------------------------------------------------------------

async function main() {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadCredentials()) })
  }
  const db = getFirestore()

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
  const r2: R2Context = { s3, bucket, publicUrlBase }

  console.log(`Mode: ${APPLY ? 'APPLY (will write)' : 'DRY-RUN'}`)

  const collResult = await migrateCustomerLogosCollection(db, r2)

  console.log('\n=== Summary ===')
  console.log(
    `  customer_logos: scanned=${collResult.scanned}, uploaded=${collResult.uploaded}, updated=${collResult.updated}, skipped=${collResult.skipped}`,
  )

  if (!APPLY) {
    console.log('\n(dry-run) Re-run with `-- --apply` to upload to R2 and persist.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
