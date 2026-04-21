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

const localeString = (text: string) => ({ en: text, fr: text, nl: text })

type TimelineEvent = {
  year: string
  title: unknown
  description: unknown
}

async function migrateTimeline() {
  const ref = doc(db, 'pages', 'about')
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    console.error('pages/about not found')
    return
  }

  const data = snap.data() as { sections?: Array<Record<string, unknown>> }
  const sections = data.sections ?? []

  const timelineIndex = sections.findIndex((s) => s.type === 'timeline')
  if (timelineIndex === -1) {
    console.error('No timeline section found on pages/about')
    return
  }

  const timeline = sections[timelineIndex] as { events?: TimelineEvent[] }
  const events = timeline.events ?? []

  const filtered = events.filter((e) => e.year !== '1997')
  const updated = filtered.map((e) => {
    if (e.year === '2003') {
      return {
        ...e,
        title: localeString('COIN Founded in the Netherlands'),
        description: localeString('COIN was founded in the Netherlands'),
      }
    }
    return e
  })

  const nextSections = [...sections]
  nextSections[timelineIndex] = { ...timeline, events: updated }

  await updateDoc(ref, { sections: nextSections })

  console.log('Timeline migration complete.')
  console.log(`  Removed ${events.length - filtered.length} event(s) for year 1997`)
  console.log(`  Updated ${filtered.length - updated.filter((_, i) => updated[i] === filtered[i]).length} event(s) for year 2003`)
  console.log(`  Final event count: ${updated.length}`)
}

migrateTimeline().catch((err) => {
  console.error(err)
  process.exit(1)
})
