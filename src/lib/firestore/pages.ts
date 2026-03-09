import { collection, doc, getDoc, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { PageDocument } from '../types/page'
import { serializeFirestoreData } from './serialize'

export async function getPage(slug: string): Promise<PageDocument | null> {
  try {
    const docRef = doc(db, 'pages', slug)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return serializeFirestoreData<PageDocument>({ slug, ...docSnap.data() })
  } catch (error) {
    console.error(`Error fetching page "${slug}":`, error)
    return null
  }
}

export async function getAllPages(): Promise<PageDocument[]> {
  try {
    const snapshot = await getDocs(collection(db, 'pages'))
    return snapshot.docs.map(d => serializeFirestoreData<PageDocument>({ slug: d.id, ...d.data() }))
  } catch (error) {
    console.error('Error fetching all pages:', error)
    return []
  }
}
