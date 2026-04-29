import { collection, query, where, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { Article } from '../types/article'
import { serializeFirestoreData } from './serialize'

export async function getPublishedArticles(): Promise<Article[]> {
  try {
    const q = query(
      collection(db, 'articles'),
      where('published', '==', true)
    )
    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(d => (serializeFirestoreData<Article>({ id: d.id, ...d.data() })))
    return items.sort((a, b) => {
      const dateA = a.publishedAt ? (typeof a.publishedAt === 'object' && 'toMillis' in a.publishedAt ? a.publishedAt.toMillis() : new Date(a.publishedAt as unknown as string).getTime()) : 0
      const dateB = b.publishedAt ? (typeof b.publishedAt === 'object' && 'toMillis' in b.publishedAt ? b.publishedAt.toMillis() : new Date(b.publishedAt as unknown as string).getTime()) : 0
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const q = query(
      collection(db, 'articles'),
      where('published', '==', true),
      where('slug.en', '==', slug),
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const d = snapshot.docs[0]
    return serializeFirestoreData<Article>({ id: d.id, ...d.data() })
  } catch (error) {
    console.error('Error fetching article by slug:', error)
    return null
  }
}
