/**
 * Insert a standalone `trusted_by` section into pages/home, right after the
 * `mission_statement` section. The marquee was previously rendered as a sibling
 * of mission_statement in code, which meant hiding the mission section also
 * hid the trusted-by strip. Promoting it to a real section lets editors toggle
 * the two independently from the visual CMS.
 *
 * Usage:
 *   npx tsx scripts/migrate-trusted-by-section.ts            # dry-run
 *   npx tsx scripts/migrate-trusted-by-section.ts --apply    # write
 *
 * Idempotent: skips if a `trusted_by` section already exists.
 *
 * Auth: reads .firebase-target-sa.json by default (TARGET_SERVICE_ACCOUNT
 * to override), or FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY env vars.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { readFileSync, existsSync } from 'node:fs'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const APPLY = process.argv.includes('--apply')

function loadCredentials(): { projectId: string; clientEmail: string; privateKey: string } {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }
  const saPath = process.env.TARGET_SERVICE_ACCOUNT ?? '.firebase-target-sa.json'
  if (!existsSync(saPath)) {
    throw new Error(`No credentials. Provide ${saPath} or set FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.`)
  }
  const sa = JSON.parse(readFileSync(saPath, 'utf8')) as {
    project_id: string
    client_email: string
    private_key: string
  }
  return { projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key }
}

interface Section {
  type?: string
  order?: number
  [key: string]: unknown
}

async function main() {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadCredentials()) })
  }
  const db = getFirestore()

  const docRef = db.collection('pages').doc('home')
  const snap = await docRef.get()
  if (!snap.exists) {
    console.error('pages/home document not found.')
    process.exit(1)
  }
  const data = snap.data() as { sections?: Section[] }
  const sections = data.sections ?? []

  if (sections.some((s) => s.type === 'trusted_by')) {
    console.log('A trusted_by section already exists. Nothing to do.')
    return
  }

  const missionIdx = sections.findIndex((s) => s.type === 'mission_statement')
  if (missionIdx === -1) {
    console.error('No mission_statement section to anchor against.')
    process.exit(1)
  }

  const missionOrder = sections[missionIdx].order ?? missionIdx
  const newSection: Section = { type: 'trusted_by', order: missionOrder + 1 }

  // Bump order of every section that comes after mission_statement so the
  // new section slots in cleanly without colliding.
  const newSections = sections.map((s) => {
    const o = s.order ?? 0
    if (o > missionOrder) return { ...s, order: o + 1 }
    return s
  })
  newSections.splice(missionIdx + 1, 0, newSection)

  console.log(`Inserting trusted_by at order ${newSection.order} (after mission_statement at order ${missionOrder}).`)
  console.log('Sections after migration:')
  for (const s of newSections) {
    console.log(`  order ${s.order}: ${s.type}`)
  }

  if (!APPLY) {
    console.log('\n(dry-run) Pass --apply to persist.')
    return
  }

  await docRef.update({ sections: newSections, updatedAt: Timestamp.now() })
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
