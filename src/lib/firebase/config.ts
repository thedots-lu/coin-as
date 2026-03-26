import { initializeApp, getApps } from 'firebase/app'
import { getFirestore as getFirestoreLite } from 'firebase/firestore/lite'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Lite SDK — used by marketing pages (smaller bundle, server-side reads)
export const db = getFirestoreLite(app)

// Full SDK — used by admin pages (real-time, getCountFromServer, etc.)
export const dbAdmin = getFirestore(app)

export const auth = getAuth(app)
export const storage = getStorage(app)
export default app

// Firebase Analytics — client-side only (not available in SSR)
export async function initAnalytics() {
  if (typeof window === 'undefined') return null
  const { getAnalytics, isSupported } = await import('firebase/analytics')
  const supported = await isSupported()
  if (!supported) return null
  return getAnalytics(app)
}
