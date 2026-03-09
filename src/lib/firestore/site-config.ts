import { doc, getDoc } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { SiteConfig } from '../types/site-config'
import { serializeFirestoreData } from './serialize'

export async function getSiteConfig(): Promise<SiteConfig | null> {
  try {
    const docRef = doc(db, 'site_config', 'global')
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return serializeFirestoreData<SiteConfig>(docSnap.data())
  } catch (error) {
    console.error('Error fetching site config:', error)
    return null
  }
}
