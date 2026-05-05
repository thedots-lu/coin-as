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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Same lightweight markdown→HTML as the other migration: paragraphs and bullet lists only.
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

const WHY_US_CARDS = [
  {
    marker: '**Benefits of Disaster Recovery Site managed with COIN**',
    title: 'Benefits of a DRS managed with COIN',
    icon: 'Award',
    accent: 'primary' as const,
  },
  {
    marker: '**Flexible Options COIN**',
    title: 'Flexible Options',
    icon: 'Settings2',
    accent: 'primary' as const,
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

  const idx = sections.findIndex((s) => s.type === 'rich_text' && s.heading?.en === 'Why us?')
  if (idx < 0) {
    console.error('Why us? section not found')
    process.exit(1)
  }
  const target = sections[idx] as { body?: LocaleString; order: number }
  const body = target.body?.en ?? ''

  const positions = WHY_US_CARDS.map((c) => body.indexOf(c.marker))
  if (positions.some((p) => p === -1)) {
    console.error('One or more markers missing in Why us? body')
    process.exit(1)
  }
  const intro = body.slice(0, positions[0]).trim()

  const cards = WHY_US_CARDS.map((c, i) => {
    const start = positions[i] + c.marker.length
    const end = i < WHY_US_CARDS.length - 1 ? positions[i + 1] : body.length
    return {
      title: ls(c.title),
      body: ls(bulletsToHtml(body.slice(start, end).trim())),
      icon: c.icon,
      accent: c.accent,
    }
  })

  const newSection: IconCardGridSection = {
    type: 'icon_card_grid',
    order: target.order,
    heading: ls('Why us?'),
    intro: ls(intro),
    cards,
  }

  const updated = sections.slice()
  updated[idx] = newSection as unknown as Section

  await ref.update({ sections: updated, updatedAt: Timestamp.now() })

  console.log('Migrated Why us? to icon_card_grid:')
  cards.forEach((c, i) => {
    console.log(`  card[${i}] title="${c.title.en}" icon=${c.icon}`)
  })
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
