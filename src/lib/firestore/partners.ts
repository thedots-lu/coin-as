import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Partner } from '../types/partner'
import { serializeFirestoreData } from './serialize'

export async function getPublishedPartners(): Promise<Partner[]> {
  try {
    const q = query(
      collection(db, 'partners'),
      where('published', '==', true)
    )
    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(d => (serializeFirestoreData<Partner>({ id: d.id, ...d.data() })))
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching partners:', error)
    return []
  }
}
