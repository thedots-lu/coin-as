import { doc, getDoc } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { MainNavigation, FooterNavigation } from '../types/navigation'
import { serializeFirestoreData } from './serialize'

export async function getMainNavigation(): Promise<MainNavigation | null> {
  try {
    const docRef = doc(db, 'navigation', 'main')
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return serializeFirestoreData<MainNavigation>(docSnap.data())
  } catch (error) {
    console.error('Error fetching main navigation:', error)
    return null
  }
}

export async function getFooterNavigation(): Promise<FooterNavigation | null> {
  try {
    const docRef = doc(db, 'navigation', 'footer')
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return serializeFirestoreData<FooterNavigation>(docSnap.data())
  } catch (error) {
    console.error('Error fetching footer navigation:', error)
    return null
  }
}
