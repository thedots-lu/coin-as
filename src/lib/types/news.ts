import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore'

export interface NewsItem {
  id: string
  title: LocaleString
  content: LocaleString
  excerpt: LocaleString
  slug: LocaleString
  imageUrl: string | null
  published: boolean
  publishedAt: Timestamp | Date | null
  author: string
  tags: string[]
  type: 'news' | 'event'
  eventDate: Timestamp | Date | null
  eventLocation: LocaleString | null
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}
