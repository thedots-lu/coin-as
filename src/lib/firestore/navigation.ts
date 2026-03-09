import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { MainNavigation, FooterNavigation } from '../types/navigation'
import { serializeFirestoreData } from './serialize'

export async function getMainNavigation(): Promise<MainNavigation | null> {
  const docRef = doc(db, 'navigation', 'main')
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return serializeFirestoreData<MainNavigation>(docSnap.data())
}

export async function getFooterNavigation(): Promise<FooterNavigation | null> {
  const docRef = doc(db, 'navigation', 'footer')
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return serializeFirestoreData<FooterNavigation>(docSnap.data())
}
