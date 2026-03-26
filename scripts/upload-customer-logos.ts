/**
 * Upload customer logos from coin-as.com → Firebase Storage
 * Run: npx tsx scripts/upload-customer-logos.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { initializeApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
})

const storage = getStorage(app)

const LOGOS = [
  { name: 'eurocontrol', url: 'https://www.coin-as.com/wp-content/uploads/2019/05/eurocontrol-logo-180x180.jpg' },
  { name: 'generali',    url: 'https://www.coin-as.com/wp-content/uploads/2017/12/Generali-logo-180x180.jpg' },
  { name: 'atradius',    url: 'https://www.coin-as.com/wp-content/uploads/2018/05/atradius-logo-vierkant-180x180.jpg' },
  { name: 'robeco',      url: 'https://www.coin-as.com/wp-content/uploads/2017/12/ROBECO-180x180.jpg' },
  { name: 'frieslandcampina', url: 'https://www.coin-as.com/wp-content/uploads/2018/01/friesland-campina-180x180.jpg' },
  { name: 'credit-europe-bank', url: 'https://www.coin-as.com/wp-content/uploads/2017/12/CEB_web-180x180.jpg' },
  { name: 'gemeente-amsterdam', url: 'https://www.coin-as.com/wp-content/uploads/2018/01/ams-vierkant2-180x180.jpg' },
  { name: 'british-american-tobacco', url: 'https://www.coin-as.com/wp-content/uploads/2017/12/british-american-tabacco-180x180.jpg' },
]

async function uploadLogo(name: string, sourceUrl: string): Promise<string> {
  console.log(`  Fetching ${name}...`)
  const response = await fetch(sourceUrl)
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${sourceUrl}`)

  const buffer = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.includes('png') ? 'png' : contentType.includes('svg') ? 'svg' : 'jpg'

  const storageRef = ref(storage, `logos/customers/${name}.${ext}`)
  await uploadBytes(storageRef, new Uint8Array(buffer), { contentType })
  const downloadUrl = await getDownloadURL(storageRef)
  console.log(`  ✓ ${name} → ${downloadUrl}`)
  return downloadUrl
}

async function main() {
  console.log('\n=== Uploading customer logos to Firebase Storage ===\n')

  const results: Record<string, string> = {}

  for (const logo of LOGOS) {
    try {
      results[logo.name] = await uploadLogo(logo.name, logo.url)
    } catch (err) {
      console.error(`  ✗ ${logo.name}: ${err}`)
    }
  }

  console.log('\n=== Done. Copy these URLs into seed-firestore.ts ===\n')
  console.log('logoUrls: [')
  Object.values(results).forEach(url => console.log(`  '${url}',`))
  console.log(']')
}

main()
