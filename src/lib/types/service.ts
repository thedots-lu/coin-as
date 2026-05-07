import { LocaleString } from './locale'
import { PageSection, SeoMeta } from './page'
import { Timestamp } from 'firebase/firestore/lite'

export type ServiceCardAccent = 'primary' | 'accent' | 'red' | 'primary-dark'

export interface ServiceCard {
  // Optional override of the service.title shown on the card / banner /
  // carousel. When empty, falls back to ServiceDocument.title.
  title?: LocaleString
  // Stored as HTML (TipTap output). The renderer sanitizes with
  // sanitizeRichHtml before injecting.
  body: LocaleString
  icon: string
  accent?: ServiceCardAccent
}

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
  // Card content shown on the /services overview grid. Title/link are
  // derived (`title` and `/services/{slug}`); only body, icon and accent
  // are editable here.
  card?: ServiceCard
  // Optional CTA link to a related article or case study, rendered on
  // the public service page above the related-services carousel. The
  // label is auto-derived from the URL pattern (article vs case study).
  articleHref?: string | null
  updatedAt: Timestamp | Date
  createdAt: Timestamp | Date
}
