import { LocaleString } from './locale'
import { PageSection, SeoMeta } from './page'
import { Timestamp } from 'firebase/firestore'

export interface ServiceDocument {
  id: string
  slug: string
  title: LocaleString
  shortTitle: LocaleString
  category: 'consulting' | 'centers' | 'cyber'
  order: number
  seo: SeoMeta
  heroSubtitle: LocaleString
  heroImageUrl: string | null
  overview: LocaleString
  sections: PageSection[]
  published: boolean
  updatedAt: Timestamp | Date
  createdAt: Timestamp | Date
}
