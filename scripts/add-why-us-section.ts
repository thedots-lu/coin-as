import { config } from 'dotenv'
config({ path: '.env.local' })
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const ls = (text: string) => ({ en: text, fr: text, nl: text })

const WHY_US_BODY = `**Benefits of Disaster Recovery Site managed with COIN**

- Benefit from 20 years of experience in managing DRS and remove the burden of DRS management from your facility and IT teams and the get right expert care from COIN team.
- Site set up and operated with business continuity in mind, all systems are redundant, all services and facilities are foreseen to resume operations and feel almost "at home".
- Continuous monitoring and 24x7 support in case of disaster.

**Flexible Options COIN**

- A la carte services: with your IT and laptops or COIN thin clients, phones, screens…
- Flexible contract options: Dedicated room + shared seats + on-demand capacity with customized service options and SLA such as use of second COIN site as backup of first one.
- Dedicated rooms designed and maintained according to the specific business requirements of your organisation for access control, IT, telecom…
- Combined with other business continuity option such as co-location for housing servers and own telecom equipment or full-fledged crisis management rooms.`

type Section = { type?: string; order?: number; heading?: { en?: string } } & Record<string, unknown>

function loadServiceAccount() {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }
  const saPath = process.env.TARGET_SERVICE_ACCOUNT ?? '.firebase-target-sa.json'
  const absolutePath = path.isAbsolute(saPath) ? saPath : path.join(process.cwd(), saPath)
  const json = JSON.parse(readFileSync(absolutePath, 'utf-8')) as {
    project_id: string
    client_email: string
    private_key: string
  }
  return {
    projectId: json.project_id,
    clientEmail: json.client_email,
    privateKey: json.private_key,
  }
}

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadServiceAccount()) })
  }
  return getFirestore()
}

async function migrate() {
  const db = getAdminDb()
  const ref = db.collection('services').doc('recovery-workplaces')
  const snap = await ref.get()
  if (!snap.exists) {
    console.error('services/recovery-workplaces not found')
    return
  }

  const data = snap.data() as { sections?: Section[] }
  const sections = data.sections ?? []

  const headingOf = (s: Section) => (s.heading as { en?: string } | undefined)?.en

  // Idempotent: drop any existing "Why us?" rich_text
  const filtered = sections.filter((s) => headingOf(s) !== 'Why us?')

  const standardOrder = filtered.find((s) => headingOf(s) === 'Standard workplace equipment')?.order ?? 2

  const whyUsSection: Section = {
    type: 'rich_text',
    order: standardOrder + 1,
    heading: ls('Why us?'),
    body: ls(WHY_US_BODY),
  }

  // Push subsequent sections down to make room for the new one
  const updated: Section[] = filtered.map((s) => {
    const order = s.order ?? 0
    if (order > standardOrder) return { ...s, order: order + 1 }
    return s
  })

  updated.push(whyUsSection)
  updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  await ref.update({ sections: updated })

  console.log('Why us? section added. New order:')
  updated.forEach((s) => {
    const h = headingOf(s) ?? (s.type === 'stats' ? '(stats block)' : '(no heading)')
    console.log(`  order=${s.order} type=${s.type} heading="${h}"`)
  })
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
