/**
 * Migrate hero carousel slide images from local /public/images paths to
 * Cloudflare R2.
 *
 * For each slide whose `imageUrl` starts with `/images/`, reads the file from
 * `public/<path>`, uploads it to R2, and replaces the URL in Firestore.
 *
 * If the hero section has no `slides[]` array yet (the carousel currently
 * renders from the in-code defaults), the script seeds the slides[] from
 * HERO_DEFAULT_SLIDES so admins can edit them via the visual CMS.
 *
 * Usage:
 *   npm run migrate-hero-images-to-r2              # dry-run
 *   npm run migrate-hero-images-to-r2 -- --apply   # actually write
 *
 * Idempotent: slides whose imageUrl is already an http(s) URL are skipped.
 *
 * Auth: .firebase-target-sa.json or FIREBASE_CLIENT_EMAIL+FIREBASE_PRIVATE_KEY.
 * R2: same env vars as /api/upload.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const APPLY = process.argv.includes('--apply')

const ls = (en: string) => ({ en, fr: '', nl: '' })
const EMPTY_LS = { en: '', fr: '', nl: '' }

// ---- Default slides (mirrors HERO_DEFAULT_SLIDES in HeroSection.tsx) -------

const HERO_DEFAULT_SLIDES = [
  {
    imageUrl: '/images/coin/coin-fotosharonwillems-60.webp',
    alt: 'COIN AS team collaborating on business continuity',
    label: ls('20 Years of Innovation'),
    title: ls('20 years of Business Continuity innovation. BeNeLux market leader.'),
    bullets: [],
    description: ls(
      'With over 20 years of experience in business continuity, COIN continuously develops innovative solutions to help organisations stay resilient in an increasingly complex business and regulatory environment.',
    ),
    visible: true,
  },
  {
    imageUrl: '/images/coin/Office-Design-3D-Graphic-3.webp',
    alt: 'COIN AS dedicated recovery office 3D design',
    label: ls('Dedicated Recovery Site'),
    title: ls('Outsource the operation of your own satellite and recovery site'),
    bullets: [
      ls('COIN builds and operates your recovery office, where you want'),
      ls('You decide how it is designed and if it is also used as satellite office'),
      ls('COIN documents procedures tests and exercices'),
      ls('COIN maintains the site and assists in case of disaster, 24x7'),
    ],
    description: { ...EMPTY_LS },
    ctaText: ls('Read our article'),
    ctaLink: '/resources',
    visible: true,
  },
  {
    imageUrl: '/images/coin/COIN_Luxembourg_Contern_Disaster_Recovery_Office_Big.webp',
    alt: 'COIN AS dedicated recovery site at Contern',
    label: ls('Testing & Exercises'),
    title: ls('Test your business continuity plan with COIN'),
    bullets: [
      ls('COIN experts help you prepare and organise your exercise'),
      ls('Our business continuity centres host 100+ exercises every year'),
      ls('Use COIN recovery office facilities and crisis management rooms'),
      ls('Service also available for organisations with their own disaster site'),
      ls('Insightful learnings and better preparation for real disasters'),
    ],
    description: { ...EMPTY_LS },
    visible: true,
  },
  {
    imageUrl: '/images/coin/coin-fotosharonwillems-36.webp',
    alt: 'COIN AS experts analyzing DORA compliance requirements',
    label: ls('NIS2 & DORA'),
    title: ls('Is your organisation ready for NIS2 and DORA?'),
    bullets: [
      ls('Free readiness assessment of your digital operational resilience'),
      ls('Personalised compliance roadmap and priority actions'),
      ls('Expert review of your ICT risk management and incident response'),
    ],
    description: { ...EMPTY_LS },
    visible: false,
  },
]

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

interface Slide {
  imageUrl: string | null
  alt?: string
  [k: string]: unknown
}

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

  console.log(`Mode: ${APPLY ? 'APPLY (will write)' : 'DRY-RUN'}`)

  const docRef = db.collection('pages').doc('home')
  const snap = await docRef.get()
  if (!snap.exists) {
    console.error('pages/home not found.')
    process.exit(1)
  }
  const data = snap.data() as { sections?: Array<{ type?: string; slides?: Slide[] }> }
  const sections = data.sections ?? []
  const idx = sections.findIndex((s) => s.type === 'hero')
  if (idx === -1) {
    console.error('No hero section in pages/home.')
    process.exit(1)
  }

  const hero = sections[idx]
  const incomingSlides: Slide[] =
    Array.isArray(hero.slides) && hero.slides.length > 0
      ? hero.slides
      : (HERO_DEFAULT_SLIDES as Slide[])

  console.log(
    `hero section at sections[${idx}], using ${
      Array.isArray(hero.slides) ? 'Firestore' : 'in-code defaults'
    } (${incomingSlides.length} slides).`,
  )

  const newSlides: Slide[] = []
  for (let i = 0; i < incomingSlides.length; i++) {
    const slide = incomingSlides[i]
    const url = slide.imageUrl
    if (!url) {
      console.log(`  slide ${i}: no imageUrl, copying as-is`)
      newSlides.push(slide)
      continue
    }
    if (/^https?:\/\//i.test(url)) {
      console.log(`  slide ${i}: already remote (${url}), skipping`)
      newSlides.push(slide)
      continue
    }
    if (!url.startsWith('/')) {
      console.log(`  slide ${i}: unexpected URL shape (${url}), skipping`)
      newSlides.push(slide)
      continue
    }

    const localPath = path.join(process.cwd(), 'public', url.replace(/^\/+/, ''))
    if (!existsSync(localPath)) {
      console.warn(`  slide ${i}: local file missing at ${localPath}, leaving URL`)
      newSlides.push(slide)
      continue
    }

    const filename = path.basename(localPath)
    const safe = filename.replace(/[^a-zA-Z0-9._-]+/g, '-')
    const key = `pages/home/hero/${Date.now()}-${i}-${safe}`
    const finalUrl = `${publicUrlBase}/${key}`
    console.log(`  slide ${i}: ${url} → ${finalUrl}`)

    if (APPLY) {
      const body = readFileSync(localPath)
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: mimeFor(filename),
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      )
    }

    newSlides.push({ ...slide, imageUrl: finalUrl })
  }

  // Anything to do?
  const before = JSON.stringify({ slides: hero.slides ?? null })
  const after = JSON.stringify({ slides: newSlides })
  if (before === after) {
    console.log('\nNo changes needed (every slide already on a remote URL).')
    return
  }

  if (!APPLY) {
    console.log('\n(dry-run) Would write the migrated slides[] to pages/home.')
    console.log('         Run again with --apply to upload + persist.')
    return
  }

  const newSections = [...sections]
  newSections[idx] = { ...hero, slides: newSlides }
  await docRef.update({ sections: newSections, updatedAt: Timestamp.now() })
  console.log('\nMigrated.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
