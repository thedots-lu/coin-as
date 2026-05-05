import { config } from 'dotenv'
config({ path: '.env.local' })
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// Slugs that ship as live service pages today. Anything else in the
// `services` collection is treated as orphaned legacy content and
// flipped to published=false. The dev-curated KNOWN_SERVICES list in
// the admin shouldn't include them either.
const CANONICAL_SLUGS = new Set([
  'recovery-workplaces',
  'consultancy-and-training',
  'it-housing',
  'cyberresilience',
  'crisis-management',
])

// `services/overview` is a marker doc for the /services index page; we
// keep it published so the menu derivation can pin it first.
const PINNED_SLUGS = new Set(['overview'])

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

async function migrate() {
  // 1. Flip orphan services to published=false
  const snap = await db.collection('services').get()
  let unpublished = 0
  let kept = 0
  for (const doc of snap.docs) {
    const data = doc.data() as { slug?: string; published?: boolean }
    const slug = data.slug ?? doc.id
    const isLive = CANONICAL_SLUGS.has(slug) || PINNED_SLUGS.has(slug)
    if (!isLive && data.published !== false) {
      await doc.ref.update({ published: false })
      console.log(`  unpublished: ${doc.id} (slug=${slug})`)
      unpublished += 1
    } else if (isLive) {
      kept += 1
    }
  }
  console.log(`Services: kept ${kept} live, unpublished ${unpublished} orphans.`)

  // 2. Drop the hand-curated children of the "Services" nav item — the
  //    children are now derived at render time from the services
  //    collection. The parent entry stays.
  const navRef = db.collection('navigation').doc('main')
  const navSnap = await navRef.get()
  if (navSnap.exists) {
    const data = navSnap.data() as { items?: Array<{ path?: string; children?: unknown }> }
    const items = (data.items ?? []).map((item) =>
      item.path === '/services' ? { ...item, children: null } : item,
    )
    await navRef.update({ items, updatedAt: FieldValue.serverTimestamp() })
    console.log('Cleared hand-curated Services children in navigation/main.')
  }
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
