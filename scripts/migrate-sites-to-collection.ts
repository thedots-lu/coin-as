/**
 * Migrate the per-page sites lists into a single shared `sites` collection.
 *
 * Source of truth: the `site_gallery` section of `pages/locations` (richer
 * data — name, country, address, phone, imageUrl, description, capacity,
 * mapUrl). Each entry is uploaded to R2 (image), then created as a doc in
 * the `sites` collection. The `MapOverview` compact card on About reads
 * the same collection at render time.
 *
 * The compact `MapOverview` data on About used to come from a hardcoded
 * SITES array in the component — we hardcode here the colour mapping
 * (Amsterdam → blue, Antwerp → green, Munsbach/Contern → red) so the new
 * sites docs carry it. After this migration the SITES array becomes dead
 * code and can be removed in a follow-up.
 *
 * Usage:
 *   npx tsx scripts/migrate-sites-to-collection.ts              # dry-run
 *   npx tsx scripts/migrate-sites-to-collection.ts -- --apply   # apply
 *
 * Idempotent: skips entries whose imageUrl is already on R2 and whose
 * matching site doc already exists (matched by EN name).
 *
 * Auth: .firebase-target-sa.json (or TARGET_SERVICE_ACCOUNT env var).
 * R2: R2_ACCOUNT_ID, R2_BUCKET, R2_PUBLIC_URL, R2_ACCESS_KEY_ID,
 *     R2_SECRET_ACCESS_KEY.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const APPLY = process.argv.includes('--apply')

// Hardcoded accent colours, keyed by EN name (matches the legacy compact
// card mapping in MapOverview).
const COLOR_BY_NAME: Record<string, string> = {
  Amsterdam: '#004779',
  Antwerp: '#009900',
  Munsbach: '#A51218',
  Contern: '#A51218',
}

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
      '.avif': 'image/avif',
    } as Record<string, string>
  )[ext] ?? 'application/octet-stream'
}

interface R2Context {
  s3: S3Client
  bucket: string
  publicUrlBase: string
}

async function uploadOne(ctx: R2Context, url: string, keyPrefix: string): Promise<string> {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url // already remote
  if (!url.startsWith('/')) return url
  const localPath = path.join(process.cwd(), 'public', url.replace(/^\/+/, ''))
  if (!existsSync(localPath)) {
    console.warn(`  · local file missing: ${localPath} — leaving URL as-is`)
    return url
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
  return finalUrl
}

interface SiteGalleryItem {
  name?: { en?: string; fr?: string; nl?: string }
  country?: { en?: string; fr?: string; nl?: string }
  imageUrl?: string
  description?: { en?: string; fr?: string; nl?: string }
  address?: string
  phone?: string
  capacity?: { en?: string; fr?: string; nl?: string }
  mapUrl?: string
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

  // Read site_gallery from pages/locations
  const locationsSnap = await db.collection('pages').doc('locations').get()
  if (!locationsSnap.exists) {
    console.error('pages/locations not found.')
    process.exit(1)
  }
  const locationsData = locationsSnap.data() as {
    sections?: Array<{ type?: string; sites?: SiteGalleryItem[] }>
  }
  const sectionsList = locationsData.sections ?? []
  const galleryIdx = sectionsList.findIndex((s) => s.type === 'site_gallery')
  if (galleryIdx === -1) {
    console.error('No site_gallery section in pages/locations.')
    process.exit(1)
  }
  const gallerySites = sectionsList[galleryIdx].sites ?? []
  if (gallerySites.length === 0) {
    console.error('site_gallery has no sites.')
    process.exit(1)
  }

  console.log(`\nFound ${gallerySites.length} sites in pages/locations site_gallery.\n`)

  // Existing sites collection — match by EN name to avoid duplicates.
  const existingSnap = await db.collection('sites').get()
  const existingByName = new Map<string, string>() // EN name -> doc id
  existingSnap.forEach((d) => {
    const data = d.data() as { name?: { en?: string } }
    if (data.name?.en) existingByName.set(data.name.en.toLowerCase(), d.id)
  })

  let created = 0
  let updated = 0
  let skipped = 0

  for (let i = 0; i < gallerySites.length; i++) {
    const src = gallerySites[i]
    const enName = src.name?.en ?? ''
    if (!enName) {
      console.log(`  [${i}] skip: no EN name`)
      skipped++
      continue
    }
    const existingId = existingByName.get(enName.toLowerCase())
    if (existingId) {
      console.log(`  [${i}] ${enName}: already in collection (id=${existingId}) — skip`)
      skipped++
      continue
    }

    const docRef = APPLY ? db.collection('sites').doc() : { id: `_dry_${i}` }
    const docId = docRef.id

    const newImageUrl = src.imageUrl
      ? await uploadOne(r2, src.imageUrl, `sites/${docId}`)
      : ''

    const color = COLOR_BY_NAME[enName] ?? '#004779'

    const payload = {
      name: src.name ?? { en: enName, fr: '', nl: '' },
      country: src.country ?? { en: '', fr: '', nl: '' },
      address: src.address ?? '',
      phone: src.phone ?? '',
      imageUrl: newImageUrl,
      description: src.description ?? { en: '', fr: '', nl: '' },
      capacity: src.capacity ?? { en: '', fr: '', nl: '' },
      mapUrl: src.mapUrl ?? '',
      color,
      order: i,
      visible: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    console.log(`  [${i}] ${enName}: → sites/${docId}`)
    console.log(`        image: ${src.imageUrl} → ${newImageUrl || '(none)'}`)

    if (APPLY) {
      await (docRef as FirebaseFirestore.DocumentReference).set(payload)
      created++
    } else {
      created++
    }
  }

  console.log('\n=== Summary ===')
  console.log(`  created: ${created}`)
  console.log(`  updated: ${updated}`)
  console.log(`  skipped: ${skipped}`)

  if (!APPLY) {
    console.log('\n(dry-run) Re-run with `-- --apply` to upload + persist.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
