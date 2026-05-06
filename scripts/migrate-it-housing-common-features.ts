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

const SECTION_HEADING = 'Common IT Housing Features'

const newSection: Omit<FeaturesListSection, 'order'> = {
  type: 'features_list',
  heading: ls(SECTION_HEADING),
  columnsPerRow: 2,
  features: [
    {
      title: ls('24x7 secured access'),
      description: ls(
        'Co-location area with named badges to open doors of rooms, cages and racks, video monitoring, intrusion detection and logs of access.',
      ),
      icon: 'ShieldCheck',
    },
    {
      title: ls('Fully redundant power systems'),
      description: ls('UPS, dual transformer and two diesel power generators.'),
      icon: 'Zap',
    },
    {
      title: ls('Fully redundant HVAC systems'),
      description: ls('Two main systems and two distribution units in each room.'),
      icon: 'Snowflake',
    },
    {
      title: ls('Connectivity'),
      description: ls('All main ISP and telecom providers in Luxembourg.'),
      icon: 'Network',
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
