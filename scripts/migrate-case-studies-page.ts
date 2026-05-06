import { config } from 'dotenv'
config({ path: '.env.local' })
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { LocaleString } from '../src/lib/types/locale'
import { PageIntroSection } from '../src/lib/types/page'

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

const HEADING_EN =
  "You can't plan the unexpected but you can get prepared to respond."

const BODY_PARAGRAPHS = [
  'Our experience shows that, in most cases, the events that actually disrupt business operations are not major incidents such as a fire or a major cyberattack — for which numerous preventive measures are put in place — but rather more trivial situations that, unfortunately, occur more frequently.',
  'These situations range from flooding following a storm caused by a blocked roof drain to an internet connection failure due to roadworks, as well as prolonged breakdowns of the heating system due to a lack of spare parts, leaks in air-conditioning systems, or incidents blocking access to the street. In such circumstances, homeworking can help to manage the situation during the initial hours, depending on the type of business, but often does not provide an adequate solution when resolving the problem takes several days or even many weeks.',
  'We share below some examples of real-life events and how our customer and COIN dealt with it.',
  'COIN customers are also entitled to use our services for situations which, although planned, nonetheless disrupt business operations and require temporary alternative facilities offering the same level of security and redundancy of their primary office. Examples include building works, urgent maintenance, relocations, major projects or hosting large audits teams.',
]

const BODY_HTML_EN = BODY_PARAGRAPHS.map((p) => `<p>${p}</p>`).join('')

const introSection: PageIntroSection = {
  type: 'page_intro',
  order: 0,
  heading: ls(HEADING_EN),
  body: ls(BODY_HTML_EN),
}

async function migrate() {
  const ref = db.collection('pages').doc('case-studies')
  const snap = await ref.get()
  const now = Timestamp.now()

  const basePayload = {
    slug: 'case-studies',
    title: ls('Case Studies'),
    seo: {
      metaTitle: ls('Case Studies'),
      metaDescription: ls(
        'Real customer success stories on business continuity and disaster recovery solutions.',
      ),
      ogImage: null,
    },
    sections: [introSection],
    updatedAt: now,
  }

  if (!snap.exists) {
    await ref.set({ ...basePayload, createdAt: now })
    console.log('Created pages/case-studies.')
    return
  }

  await ref.update({
    ...basePayload,
    // Drop the legacy body field — content now lives in the page_intro section.
    body: FieldValue.delete(),
  })
  console.log('Updated pages/case-studies in place (body → page_intro section).')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
