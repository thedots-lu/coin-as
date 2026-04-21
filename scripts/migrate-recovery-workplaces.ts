import { config } from 'dotenv'
config({ path: '.env.local' })
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const ls = (text: string) => ({ en: text, fr: text, nl: text })

type Section = { type?: string; order?: number; heading?: { en?: string } } & Record<string, unknown>

const statsSection: Section = {
  type: 'stats',
  order: 1,
  stats: [
    { value: 20, suffix: '+', label: ls('Years of Experience') },
    { value: 300, suffix: '+', label: ls('Customers') },
    { value: 1000, suffix: '+', label: ls('Recovery Workplaces') },
    { value: 350, suffix: '+', label: ls('Business Continuity Plans') },
  ],
}

async function migrate() {
  const ref = doc(db, 'services', 'recovery-workplaces')
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    console.error('services/recovery-workplaces not found')
    return
  }

  const data = snap.data() as { sections?: Section[] }
  const sections = data.sections ?? []

  const headingOf = (s: Section) => (s.heading as { en?: string } | undefined)?.en

  // Remove any existing "COIN in numbers" rich_text (or stats) sections
  const filtered = sections.filter((s) => {
    if (headingOf(s) === 'COIN in numbers') return false
    if (s.type === 'stats') return false
    return true
  })

  // Renumber remaining + insert the stats block at order 1
  const updated: Section[] = filtered.map((s) => {
    if (headingOf(s) === 'Our Recovery Workplaces solution') return { ...s, order: 0 }
    if (headingOf(s) === 'Standard workplace equipment') return { ...s, order: 2 }
    return s
  })

  updated.push(statsSection)
  updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  await updateDoc(ref, { sections: updated })

  console.log('Recovery Workplaces migration complete. New order:')
  updated.forEach((s) => {
    const h = headingOf(s) ?? (s.type === 'stats' ? '(stats block)' : '(no heading)')
    console.log(`  order=${s.order} type=${s.type} heading="${h}"`)
  })
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
