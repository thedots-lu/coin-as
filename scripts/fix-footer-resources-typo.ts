/**
 * One-off: fixes the French-spelled "Ressources" heading in the footer
 * navigation back to the English "Resources" (the site is English-only).
 *
 * Idempotent: only touches a column whose English heading is exactly
 * "Ressources" (case-insensitive); logs and exits otherwise.
 *
 * Run with `npx tsx scripts/fix-footer-resources-typo.ts`.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { readFileSync, existsSync } from 'node:fs'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore'

type LocaleString = { en: string; fr: string; nl: string }
interface FooterColumn {
  heading: LocaleString
  links: unknown[]
}

function loadCredentials(): { projectId: string; clientEmail: string; privateKey: string } {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }
  const path = '.firebase-target-sa.json'
  if (existsSync(path)) {
    const sa = JSON.parse(readFileSync(path, 'utf8'))
    return { projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key }
  }
  throw new Error('Missing Firebase admin credentials')
}

function getFirestore(): Firestore {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadCredentials()) })
  }
  return getAdminFirestore()
}

async function main() {
  const db = getFirestore()
  const ref = db.collection('navigation').doc('footer')
  const snap = await ref.get()
  if (!snap.exists) {
    console.log('No navigation/footer doc — nothing to do.')
    return
  }

  const data = snap.data() as { columns?: FooterColumn[] }
  const columns = data.columns ?? []
  let changed = false

  const next = columns.map((col) => {
    if ((col.heading?.en ?? '').trim().toLowerCase() === 'ressources') {
      changed = true
      return { ...col, heading: { ...col.heading, en: 'Resources' } }
    }
    return col
  })

  if (!changed) {
    console.log('No "Ressources" heading found — already correct, nothing to do.')
    return
  }

  await ref.update({ columns: next })
  console.log('✓ Footer heading fixed: "Ressources" → "Resources".')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
