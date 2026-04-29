import { collection, query, where, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { NewsItem } from '../types/news'
import { serializeFirestoreData } from './serialize'

export async function getPublishedNews(): Promise<NewsItem[]> {
  try {
    const q = query(
      collection(db, 'news'),
      where('published', '==', true)
    )
    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(d => (serializeFirestoreData<NewsItem>({ id: d.id, ...d.data() })))
    return items.sort((a, b) => {
      const dateA = a.publishedAt ? (typeof a.publishedAt === 'object' && 'toMillis' in a.publishedAt ? a.publishedAt.toMillis() : new Date(a.publishedAt as unknown as string).getTime()) : 0
      const dateB = b.publishedAt ? (typeof b.publishedAt === 'object' && 'toMillis' in b.publishedAt ? b.publishedAt.toMillis() : new Date(b.publishedAt as unknown as string).getTime()) : 0
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error fetching published news:', error)
    return []
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const q = query(
      collection(db, 'news'),
      where('published', '==', true),
      where('slug.en', '==', slug),
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const d = snapshot.docs[0]
    return serializeFirestoreData<NewsItem>({ id: d.id, ...d.data() })
  } catch (error) {
    console.error('Error fetching news by slug:', error)
    return null
  }
}

export async function getAllNews(): Promise<NewsItem[]> {
  try {
    const snapshot = await getDocs(collection(db, 'news'))
    const items = snapshot.docs.map(d => (serializeFirestoreData<NewsItem>({ id: d.id, ...d.data() })))
    return items.sort((a, b) => {
      const dateA = a.createdAt ? (typeof a.createdAt === 'object' && 'toMillis' in a.createdAt ? a.createdAt.toMillis() : new Date(a.createdAt as unknown as string).getTime()) : 0
      const dateB = b.createdAt ? (typeof b.createdAt === 'object' && 'toMillis' in b.createdAt ? b.createdAt.toMillis() : new Date(b.createdAt as unknown as string).getTime()) : 0
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error fetching all news:', error)
    return []
  }
}
