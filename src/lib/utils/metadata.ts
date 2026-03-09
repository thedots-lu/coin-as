import { Metadata } from 'next'
import { LocaleString } from '../types/locale'
import { SeoMeta } from '../types/page'
import { getLocalizedField } from '../locale'

export function generatePageMetadata(
  seo: SeoMeta | undefined,
  title: LocaleString | undefined,
  locale: string = 'en'
): Metadata {
  const loc = locale as 'en' | 'fr' | 'nl'
  const metaTitle = seo ? getLocalizedField(seo.metaTitle, loc) : getLocalizedField(title, loc)
  const metaDescription = seo ? getLocalizedField(seo.metaDescription, loc) : ''

  return {
    title: metaTitle ? `${metaTitle} | COIN` : 'COIN - Business Continuity',
    description: metaDescription || 'COIN - For over 20 years dedicated to business continuity in the BeNeLux',
    openGraph: {
      title: metaTitle || 'COIN',
      description: metaDescription || '',
      images: seo?.ogImage ? [seo.ogImage] : [],
    },
  }
}
