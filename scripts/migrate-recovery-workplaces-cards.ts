import { config } from 'dotenv'
config({ path: '.env.local' })
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { LocaleString } from '../src/lib/types/locale'
import { IconCardGridSection, PageSection } from '../src/lib/types/page'

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

// Markdown bullet list → simple <ul><li>…</li></ul> HTML.
// The body content is plain prose / bullet lists; we don't need a full
// markdown parser. Anything starting with "- " becomes a list item; the
// rest stays as paragraphs.
function bulletsToHtml(markdown: string): string {
  const lines = markdown.trim().split(/\r?\n/)
  const out: string[] = []
  let bullets: string[] = []

  const flushBullets = () => {
    if (bullets.length === 0) return
    out.push('<ul>' + bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('') + '</ul>')
    bullets = []
  }
  const flushParagraph = (text: string) => {
    if (text.trim()) out.push(`<p>${escapeHtml(text.trim())}</p>`)
  }

  for (const line of lines) {
    const m = line.match(/^\s*-\s+(.*)$/)
    if (m) {
      bullets.push(m[1].trim())
    } else {
      flushBullets()
      flushParagraph(line)
    }
  }
  flushBullets()
  return out.join('')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const STANDARD_WORKPLACE_CARDS = [
  {
    marker: '**Workstation setup**',
    title: 'Workstation setup',
    icon: 'Monitor',
    accent: 'accent' as const,
  },
  {
    marker: '**Common areas (included at no additional cost)**',
    title: 'Common areas',
    icon: 'Coffee',
    accent: 'accent' as const,
  },
  {
    marker: '**Security and access**',
    title: 'Security and access',
    icon: 'ShieldCheck',
    accent: 'accent' as const,
  },
  {
    marker: '**The numbers**',
    title: 'The numbers',
    icon: 'BarChart3',
    accent: 'accent' as const,
  },
]

type Section = PageSection & { heading?: { en?: string }; body?: { en?: string } }

async function migrate() {
  const ref = db.collection('services').doc('recovery-workplaces')
  const snap = await ref.get()
  if (!snap.exists) {
    console.error('recovery-workplaces not found')
    process.exit(1)
  }
  const data = snap.data() as { sections?: Section[] }
  const sections = data.sections ?? []

  const stdIndex = sections.findIndex(
    (s) => s.type === 'rich_text' && s.heading?.en === 'Standard workplace equipment',
  )
  if (stdIndex < 0) {
    console.error('Standard workplace equipment section not found')
    process.exit(1)
  }
  const stdSection = sections[stdIndex] as { body?: LocaleString; order: number }
  const body = stdSection.body?.en ?? ''

  // Split body by markers, build cards with HTML body.
  const positions = STANDARD_WORKPLACE_CARDS.map((c) => body.indexOf(c.marker))
  if (positions.some((p) => p === -1)) {
    console.error('One or more markers missing in current body — cannot migrate')
    process.exit(1)
  }
  const intro = body.slice(0, positions[0]).trim()

  const cards = STANDARD_WORKPLACE_CARDS.map((c, i) => {
    const start = positions[i] + c.marker.length
    const end = i < STANDARD_WORKPLACE_CARDS.length - 1 ? positions[i + 1] : body.length
    const slice = body.slice(start, end).trim()
    return {
      title: ls(c.title),
      body: ls(bulletsToHtml(slice)),
      icon: c.icon,
      accent: c.accent,
    }
  })

  const newSection: IconCardGridSection = {
    type: 'icon_card_grid',
    order: stdSection.order,
    heading: ls('Standard workplace equipment'),
    intro: ls(intro),
    cards,
  }

  const updated = sections.slice()
  updated[stdIndex] = newSection as unknown as Section

  await ref.update({ sections: updated, updatedAt: Timestamp.now() })

  console.log('Migrated Standard workplace equipment to icon_card_grid:')
  cards.forEach((c, i) => {
    console.log(`  card[${i}] title="${c.title.en}" icon=${c.icon}`)
    console.log(`    body=${c.body.en.slice(0, 80)}…`)
  })
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
