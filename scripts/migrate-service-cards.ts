import { config } from 'dotenv'
config({ path: '.env.local' })
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { ServiceCard, ServiceCardAccent } from '../src/lib/types/service'
import { LocaleString } from '../src/lib/types/locale'

const ls = (en: string): LocaleString => ({ en, fr: '', nl: '' })

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Markdown bullet list → simple HTML (paragraphs + <ul><li>).
function bulletsToHtml(markdown: string): string {
  const lines = markdown.trim().split(/\r?\n/)
  const out: string[] = []
  let bullets: string[] = []
  const flushBullets = () => {
    if (bullets.length === 0) return
    out.push('<ul>' + bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('') + '</ul>')
    bullets = []
  }
  for (const line of lines) {
    const m = line.match(/^\s*-\s+(.*)$/)
    if (m) {
      bullets.push(m[1].trim())
    } else if (line.trim()) {
      flushBullets()
      out.push(`<p>${escapeHtml(line.trim())}</p>`)
    }
  }
  flushBullets()
  return out.join('')
}

const html = (markdown: string): LocaleString => ({ en: bulletsToHtml(markdown), fr: '', nl: '' })

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

// Initial card content per service. Body lifts the current heroSubtitle
// and adds the first 3 features as bullets — same shape the public grid
// used to derive automatically. Admin can refine per service afterwards.
const CARDS: Record<string, ServiceCard> = {
  'consultancy-and-training': {
    title: ls(''),
    body: html(
      'Plan, train and stress-test your business continuity capability with our advisors and exercises.\n\n- Business Impact Analysis\n- Continuity & crisis plans\n- Simulations and tabletop exercises',
    ),
    icon: 'GraduationCap',
    accent: 'accent',
  },
  'recovery-workplaces': {
    title: ls(''),
    body: html(
      '24x7 fully equipped offices ready in hours, in dedicated rooms or shared resilience centres.\n\n- Workstations, phones, screens\n- Common areas, restaurant, parking\n- Secure access, individual badge & PIN',
    ),
    icon: 'Building2',
    accent: 'primary',
  },
  'crisis-management': {
    title: ls(''),
    body: html(
      'War rooms and on-site support to coordinate your response when disruption hits.\n\n- Dedicated crisis rooms\n- Communication infrastructure\n- 24x7 expert support',
    ),
    icon: 'AlertTriangle',
    accent: 'accent',
  },
  'it-housing': {
    title: ls(''),
    body: html(
      'Resilient DRP hosting in Luxembourg, co-located with recovery offices.\n\n- Tier-grade datacentre\n- Tailored cabinets and connectivity\n- Combined with recovery seats',
    ),
    icon: 'Server',
    accent: 'primary-dark',
  },
  cyberresilience: {
    title: ls(''),
    body: html(
      'Tools and procedures to prevent, detect and recover from cyber incidents.\n\n- Phishing prevention\n- Clean Azure tenant\n- Recovery laptops & USB keys',
    ),
    icon: 'Shield',
    accent: 'red',
  },
}

async function migrate() {
  for (const [slug, card] of Object.entries(CARDS)) {
    const ref = db.collection('services').doc(slug)
    const snap = await ref.get()
    if (!snap.exists) {
      console.warn(`  skip: services/${slug} not found`)
      continue
    }
    await ref.update({ card, updatedAt: Timestamp.now() })
    console.log(`  set card for services/${slug} (icon=${card.icon}, accent=${card.accent ?? 'primary'})`)
  }
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})

// Suppress "unused" lint on the union type import — kept for future expansion.
export type _Accent = ServiceCardAccent
