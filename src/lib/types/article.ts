import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore/lite'

export interface Article {
  id: string
  title: LocaleString
  content: LocaleString
  excerpt: LocaleString
  slug: LocaleString
  imageUrl: string | null
  videoUrl?: string | null
  category: 'resource' | 'case_study'
  published: boolean
  publishedAt: Timestamp | Date | null
  author: string
  tags: string[]
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface WhitePaper {
  id: string
  title: LocaleString
  description: LocaleString
  category: string            // e.g. 'cyber_resilience', 'business_continuity', 'regulatory'
  fileUrl: string             // Firebase Storage URL
  thumbnailUrl: string | null
  pages?: number
  published: boolean
  publishedAt: Timestamp | Date | null
  downloadCount?: number
  tags: string[]
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}
