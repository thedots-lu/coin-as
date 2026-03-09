import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { ServiceDocument } from '../types/service'
import { serializeFirestoreData } from './serialize'

export async function getPublishedServices(): Promise<ServiceDocument[]> {
  try {
    const q = query(
      collection(db, 'services'),
      where('published', '==', true)
    )
    const snapshot = await getDocs(q)
    const services = snapshot.docs.map(d => (serializeFirestoreData<ServiceDocument>({ id: d.id, ...d.data() })))
    return services.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching published services:', error)
    return []
  }
}

export async function getServiceBySlug(slug: string): Promise<ServiceDocument | null> {
  try {
    // Try fetching by document ID first (slug is used as doc ID in seed)
    const docRef = doc(db, 'services', slug)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.published !== false) {
        return serializeFirestoreData<ServiceDocument>({ id: docSnap.id, ...data })
      }
    }
    // Fallback: query by slug field
    const q = query(
      collection(db, 'services'),
      where('slug', '==', slug)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const d = snapshot.docs[0]
    return { id: d.id, ...d.data() } as ServiceDocument
  } catch (error) {
    console.error('Error fetching service by slug:', error)
    return null
  }
}

export async function getAllServices(): Promise<ServiceDocument[]> {
  try {
    const snapshot = await getDocs(collection(db, 'services'))
    const services = snapshot.docs.map(d => (serializeFirestoreData<ServiceDocument>({ id: d.id, ...d.data() })))
    return services.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching all services:', error)
    return []
  }
}
