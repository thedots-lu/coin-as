import { collection, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { Site } from '../types/site'
import { serializeFirestoreData } from './serialize'

export async function getPublishedSites(): Promise<Site[]> {
  try {
    const snapshot = await getDocs(collection(db, 'sites'))
    const items = snapshot.docs.map((d) =>
      serializeFirestoreData<Site>({ id: d.id, ...d.data() }),
    )
    return items
      .filter((s) => s.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching sites:', error)
    return []
  }
}
