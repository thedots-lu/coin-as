import { config } from 'dotenv'
config({ path: '.env.local' })
import { readFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

function loadServiceAccount() {
  const p = path.join(process.cwd(), '.firebase-target-sa.json')
  const j = JSON.parse(readFileSync(p, 'utf-8')) as {
    project_id: string
    client_email: string
    private_key: string
  }
  return { projectId: j.project_id, clientEmail: j.client_email, privateKey: j.private_key }
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(loadServiceAccount()) })
}
const db = getFirestore()

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET = process.env.R2_BUCKET
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '')

if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET ||
  !R2_PUBLIC_URL
) {
  console.error('Missing R2 env vars (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_PUBLIC_URL).')
  process.exit(1)
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

function keyFromPublicUrl(url: string): string | null {
  if (!url.startsWith(R2_PUBLIC_URL + '/')) return null
  return url.slice(R2_PUBLIC_URL.length + 1)
}

function contentTypeFromKey(key: string): string {
  const ext = path.extname(key).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.svg') return 'image/svg+xml'
  return 'application/octet-stream'
}

async function fetchBytes(url: string): Promise<Buffer> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`)
  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
}

async function run() {
  const snap = await db.collection('customer_logos').get()
  console.log(`Re-trimming ${snap.size} customer logos…`)

  let trimmed = 0
  let skipped = 0
  let failed = 0

  for (const docSnap of snap.docs) {
    const data = docSnap.data() as { name?: string; imageUrl?: string }
    const url = data.imageUrl
    const label = data.name ?? docSnap.id

    if (!url) {
      console.log(`  · ${label}: no imageUrl, skipped`)
      skipped++
      continue
    }
    const oldKey = keyFromPublicUrl(url)
    if (!oldKey) {
      console.log(`  · ${label}: external URL, skipped`)
      skipped++
      continue
    }
    if (oldKey.endsWith('.svg')) {
      console.log(`  · ${label}: SVG, skipped`)
      skipped++
      continue
    }

    try {
      const original = await fetchBytes(url)
      const trimmedBuf = await sharp(original)
        .trim({ threshold: 10 })
        .toBuffer()

      // No-op detection: same byte length AND same hash → likely already trimmed.
      if (trimmedBuf.length === original.length) {
        console.log(`  · ${label}: already tight, skipped`)
        skipped++
        continue
      }

      const dir = path.posix.dirname(oldKey)
      const ext = path.extname(oldKey) || '.png'
      const newKey = `${dir}/logo-${Date.now()}${ext}`
      const contentType = contentTypeFromKey(newKey)

      await s3.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET!,
          Key: newKey,
          Body: trimmedBuf,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      )

      await docSnap.ref.update({
        imageUrl: `${R2_PUBLIC_URL}/${newKey}`,
        updatedAt: Timestamp.now(),
      })

      // Best-effort cleanup of the old object.
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET!, Key: oldKey }))
      } catch (err) {
        console.warn(`    ! could not delete old object ${oldKey}:`, err)
      }

      console.log(
        `  ✓ ${label}: ${original.length} → ${trimmedBuf.length} bytes  (${oldKey} → ${newKey})`,
      )
      trimmed++
    } catch (err) {
      console.error(`  ✗ ${label}: trim failed`, err)
      failed++
    }
  }

  console.log(`Done. trimmed=${trimmed} skipped=${skipped} failed=${failed}`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
