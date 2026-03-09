import { collection, doc, getDoc, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { PageDocument } from '../types/page'
import { serializeFirestoreData } from './serialize'

export async function getPage(slug: string): Promise<PageDocument | null> {
  const docRef = doc(db, 'pages', slug)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return serializeFirestoreData<PageDocument>({ slug, ...docSnap.data() })
}

export async function getAllPages(): Promise<PageDocument[]> {
  const snapshot = await getDocs(collection(db, 'pages'))
  return snapshot.docs.map(d => serializeFirestoreData<PageDocument>({ slug: d.id, ...d.data() }))
}
