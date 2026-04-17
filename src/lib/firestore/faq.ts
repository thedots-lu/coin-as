import { collection, query, where, getDocs } from 'firebase/firestore/lite'
import {
  collection as collectionAdmin,
  getDocs as getDocsAdmin,
  doc as docAdmin,
  getDoc as getDocAdmin,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import { db, dbAdmin } from '../firebase/config'
import { FaqItem, CreateFaqItem } from '../types/faq'
import { serializeFirestoreData } from './serialize'

const COLLECTION = 'faq_items'

export async function getPublishedFaqItems(): Promise<FaqItem[]> {
  try {
    const q = query(collection(db, COLLECTION), where('published', '==', true))
    const snapshot = await getDocs(q)
    const items = snapshot.docs.map((d) =>
      serializeFirestoreData<FaqItem>({ id: d.id, ...d.data() })
    )
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching published FAQ items:', error)
    return []
  }
}

export async function getAllFaqItems(): Promise<FaqItem[]> {
  try {
    const snapshot = await getDocsAdmin(collectionAdmin(dbAdmin, COLLECTION))
    const items = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as FaqItem)
    )
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching all FAQ items:', error)
    return []
  }
}

export async function getFaqItemById(id: string): Promise<FaqItem | null> {
  try {
    const snap = await getDocAdmin(docAdmin(dbAdmin, COLLECTION, id))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as FaqItem
  } catch (error) {
    console.error('Error fetching FAQ item by id:', error)
    return null
  }
}

export async function createFaqItem(data: CreateFaqItem): Promise<string> {
  const now = Timestamp.now()
  const ref = await addDoc(collectionAdmin(dbAdmin, COLLECTION), {
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function updateFaqItem(
  id: string,
  data: Partial<CreateFaqItem>
): Promise<void> {
  await updateDoc(docAdmin(dbAdmin, COLLECTION, id), {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteFaqItem(id: string): Promise<void> {
  await deleteDoc(docAdmin(dbAdmin, COLLECTION, id))
}
