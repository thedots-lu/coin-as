/**
 * One-off: removes the stray `FAQ → /resources/faq` entry from the
 * About-Us column of the footer navigation. The same link is already
 * present in the Resources column where it belongs.
 *
 * Idempotent: if the entry has already been removed (or the data shape
 * doesn't match what we expect), the script logs and exits without
 * touching anything.
 *
 * Run with `npx tsx scripts/fix-footer-faq-duplicate.ts`.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { readFileSync, existsSync } from 'node:fs'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import {
  getFirestore as getAdminFirestore,
  FieldValue,
  Firestore,
} from 'firebase-admin/firestore'

type LocaleString = { en: string; fr: string; nl: string }
interface FooterLink {
  label: LocaleString
  path: string
}
interface FooterColumn {
  heading: LocaleString
  links: FooterLink[]
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
    return {
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }
  }
  throw new Error('Missing Firebase admin credentials')
}

function getFirestore(): Firestore {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadCredentials()) })
  }
  return getAdminFirestore()
}

const isFaq = (l: FooterLink) =>
  l.path === '/resources/faq' || l.label?.en?.trim().toLowerCase() === 'faq'

const isResourcesHeading = (h?: LocaleString) => {
  const v = h?.en?.trim().toLowerCase() ?? ''
  return v === 'resources' || v === 'ressources' || v === 'resource'
}

async function main() {
  const db = getFirestore()
  const ref = db.collection('navigation').doc('footer')
  const snap = await ref.get()
  if (!snap.exists) {
    console.log('navigation/footer does not exist; nothing to fix.')
    return
  }
  const data = snap.data() as { columns?: FooterColumn[] } | undefined
  const columns = data?.columns
  if (!Array.isArray(columns)) {
    console.log('navigation/footer has no columns array; nothing to fix.')
    return
  }

  // Keep FAQ only in the Resources/Ressources column. Drop it from
  // every other column where it currently appears.
  let removedTotal = 0
  const nextColumns = columns.map((col) => {
    if (isResourcesHeading(col.heading)) return col
    const links = col.links ?? []
    const cleaned = links.filter((l) => !isFaq(l))
    removedTotal += links.length - cleaned.length
    return cleaned.length === links.length ? col : { ...col, links: cleaned }
  })

  if (removedTotal === 0) {
    console.log('No stray FAQ entries outside the Resources column; nothing to fix.')
    return
  }

  await ref.update({ columns: nextColumns, updatedAt: FieldValue.serverTimestamp() })
  console.log(
    `Removed ${removedTotal} stray FAQ entry/entries from non-resources columns.`,
  )
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
