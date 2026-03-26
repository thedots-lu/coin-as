import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { WhitePaper } from '../types/article'
import { serializeFirestoreData } from './serialize'

export async function getPublishedWhitePapers(): Promise<WhitePaper[]> {
  try {
    const q = query(collection(db, 'white_papers'), where('published', '==', true))
    const snapshot = await getDocs(q)
    const items = snapshot.docs.map((d) =>
      serializeFirestoreData<WhitePaper>({ id: d.id, ...d.data() })
    )
    return items.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt as unknown as string).getTime() : 0
      const dateB = b.publishedAt ? new Date(b.publishedAt as unknown as string).getTime() : 0
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error fetching white papers:', error)
    return []
  }
}

export async function incrementDownloadCount(id: string): Promise<void> {
  try {
    const ref = doc(db, 'white_papers', id)
    await updateDoc(ref, { downloadCount: increment(1) })
  } catch {
    // Non-blocking — download still proceeds
  }
}

