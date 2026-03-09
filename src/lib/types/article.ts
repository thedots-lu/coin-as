import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore'

export interface Article {
  id: string
  title: LocaleString
  content: LocaleString
  excerpt: LocaleString
  slug: LocaleString
  imageUrl: string | null
  category: 'resource' | 'case_study'
  published: boolean
  publishedAt: Timestamp | Date | null
  author: string
  tags: string[]
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}
