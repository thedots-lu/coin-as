import { config } from 'dotenv'
config({ path: '.env.local' })
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { LocaleString } from '../src/lib/types/locale'
import { FeaturesListSection, PageSection } from '../src/lib/types/page'

const ls = (en: string): LocaleString => ({ en, fr: '', nl: '' })

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

const SECTION_HEADING = 'Customized services, Flexible and Cost-effective options'

const ulFromBullets = (items: string[]) =>
  `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`

const card1Description = ulFromBullets([
  '20 years of experience in the management of business continuity centres and the provision of disaster recovery workplaces for organisations that operate 24x7.',
])

const card2Description = ulFromBullets([
  'The IT housing facilities are co-located with fully equipped recovery offices to host users in case of disaster requiring an alternate office to resume operations.',
  'Autonomous access 24x7 for registered users.',
  'High level of customization and flexibility.',
  'Tier 3 level redundancy at Munsbach site with the possibility to connect the site and the dedicated recovery rooms to a Tier 4 datacenters with our partner in Luxembourg.',
])

const newSection: Omit<FeaturesListSection, 'order'> = {
  type: 'features_list',
  heading: ls(SECTION_HEADING),
  columnsPerRow: 2,
  features: [
    {
      title: ls('Key Benefits of COIN Services and Solutions'),
      description: ls(card1Description),
      icon: 'Award',
    },
    {
      title: ls('Flexible and Cost-effective Options'),
      description: ls(card2Description),
      icon: 'Wallet',
    },
  ],
}

async function migrate() {
  const ref = db.collection('services').doc('it-housing')
  const snap = await ref.get()
  if (!snap.exists) {
    throw new Error('services/it-housing not found')
  }

  const data = snap.data() as { sections?: PageSection[] }
  const existing = data.sections ?? []

  const existingIdx = existing.findIndex(
    (s) => s.type === 'features_list' && s.heading?.en === SECTION_HEADING,
  )

  let sections: PageSection[]
  let action: string
  if (existingIdx >= 0) {
    const order = existing[existingIdx].order
    sections = existing.map((s, i) => (i === existingIdx ? { ...newSection, order } : s))
    action = `Updated "${SECTION_HEADING}" in place (order ${order})`
  } else {
    const nextOrder = existing.reduce((max, s) => Math.max(max, s.order ?? 0), -1) + 1
    sections = [...existing, { ...newSection, order: nextOrder }]
    action = `Appended "${SECTION_HEADING}" (order ${nextOrder})`
  }

  await ref.update({
    sections,
    updatedAt: Timestamp.now(),
  })
  console.log(`${action} — ${sections.length} sections total.`)
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
