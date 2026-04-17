import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore/lite'
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
import { Challenge, CreateChallenge } from '../types/challenge'
import { serializeFirestoreData } from './serialize'

export async function getPublishedChallenges(): Promise<Challenge[]> {
  try {
    const q = query(
      collection(db, 'challenges'),
      where('published', '==', true)
    )
    const snapshot = await getDocs(q)
    const items = snapshot.docs.map((d) =>
      serializeFirestoreData<Challenge>({ id: d.id, ...d.data() })
    )
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching published challenges:', error)
    return []
  }
}

export async function getChallengeBySlug(slug: string): Promise<Challenge | null> {
  try {
    const docRef = doc(db, 'challenges', slug)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.published !== false) {
        return serializeFirestoreData<Challenge>({ id: docSnap.id, ...data })
      }
    }
    const q = query(collection(db, 'challenges'), where('slug', '==', slug))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const d = snapshot.docs[0]
    return serializeFirestoreData<Challenge>({ id: d.id, ...d.data() })
  } catch (error) {
    console.error('Error fetching challenge by slug:', error)
    return null
  }
}

export async function getAllChallenges(): Promise<Challenge[]> {
  try {
    const snapshot = await getDocsAdmin(collectionAdmin(dbAdmin, 'challenges'))
    const items = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Challenge)
    )
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching all challenges:', error)
    return []
  }
}

export async function getChallengeById(id: string): Promise<Challenge | null> {
  try {
    const ref = docAdmin(dbAdmin, 'challenges', id)
    const snap = await getDocAdmin(ref)
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Challenge
  } catch (error) {
    console.error('Error fetching challenge by id:', error)
    return null
  }
}

export async function createChallenge(data: CreateChallenge): Promise<string> {
  const now = Timestamp.now()
  const ref = await addDoc(collectionAdmin(dbAdmin, 'challenges'), {
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function updateChallenge(
  id: string,
  data: Partial<CreateChallenge>
): Promise<void> {
  const ref = docAdmin(dbAdmin, 'challenges', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteChallenge(id: string): Promise<void> {
  await deleteDoc(docAdmin(dbAdmin, 'challenges', id))
}
