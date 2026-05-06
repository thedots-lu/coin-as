import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore/lite'

export type ArticleAccentColor = 'green' | 'red' | 'navy' | 'slate'

export const ARTICLE_ACCENT_COLORS: ArticleAccentColor[] = ['green', 'red', 'navy', 'slate']

export const DEFAULT_ARTICLE_ACCENT_COLOR: ArticleAccentColor = 'green'

export interface Article {
  id: string
  title: LocaleString
  content: LocaleString
  excerpt: LocaleString
  slug: LocaleString
  imageUrl: string | null
  videoUrl?: string | null
  category: 'resource' | 'case_study'
  // Optional accent colour shown as a strip on case_study cards. Ignored
  // on resource articles (which use their imageUrl or a logo fallback).
  accentColor?: ArticleAccentColor
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
