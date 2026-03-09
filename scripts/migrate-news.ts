import { config } from 'dotenv'
config({ path: '.env.local' })
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

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

async function migrateNews() {
  console.log('Starting news migration...')

  const snapshot = await getDocs(collection(db, 'news'))

  if (snapshot.empty) {
    console.log('No news documents found.')
    return
  }

  let migrated = 0
  let skipped = 0

  for (const d of snapshot.docs) {
    const data = d.data()

    // Check if already migrated (has type field)
    if (data.type) {
      console.log(`  Skipping ${d.id} (already has type field)`)
      skipped++
      continue
    }

    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
      type: 'news',
      eventDate: data.eventDate ?? null,
      eventLocation: data.eventLocation ?? null,
    }

    // Ensure imageUrl is null instead of undefined
    if (data.imageUrl === undefined) {
      updates.imageUrl = null
    }

    // Ensure publishedAt exists
    if (data.publishedAt === undefined) {
      updates.publishedAt = data.published ? serverTimestamp() : null
    }

    const docRef = doc(db, 'news', d.id)
    await updateDoc(docRef, updates)
    console.log(`  Migrated ${d.id}: added type='news', eventDate=null, eventLocation=null`)
    migrated++
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`)
}

migrateNews()
  .then(() => {
    console.log('Done.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
