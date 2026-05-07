import { Metadata } from 'next'
import { LocaleString, Locale } from '../types/locale'
import { SeoMeta } from '../types/page'
import { getLocalizedField } from '../locale'

const PUBLIC_BASE_URL = 'https://coin-bc.com'

export interface PageMetadataOptions {
  /** Public path for canonical URL and OG URL, e.g. '/', '/about'. */
  path?: string
  /** Open Graph type, defaults to 'website'. */
  ogType?: 'website' | 'article'
  locale?: Locale
}

export function generatePageMetadata(
  seo: SeoMeta | undefined,
  title: LocaleString | undefined,
  options?: PageMetadataOptions,
): Metadata {
  const loc: Locale = options?.locale ?? 'en'
  const metaTitle = seo ? getLocalizedField(seo.metaTitle, loc) : getLocalizedField(title, loc)
  const metaDescription = seo ? getLocalizedField(seo.metaDescription, loc) : ''

  const url = options?.path ? `${PUBLIC_BASE_URL}${options.path}` : undefined

  return {
    title: metaTitle || 'Business Continuity & Cyber Resilience',
    description:
      metaDescription || 'COIN - For over 20 years dedicated to business continuity in the BeNeLux',
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title: metaTitle || 'COIN',
      description: metaDescription || '',
      images: seo?.ogImage ? [seo.ogImage] : [],
      ...(url ? { url, type: options?.ogType ?? 'website' } : {}),
    },
  }
}
