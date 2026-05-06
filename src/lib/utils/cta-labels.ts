import type { Locale, LocaleString } from '@/lib/types/locale'
import { getLocalizedField } from '@/lib/locale'

/**
 * What an editor can pick for a CTA's label kind. `auto` lets the URL
 * decide; `custom` reads from a sibling `customLabel` LocaleString.
 */
export type CtaKindChoice =
  | 'auto'
  | 'article'
  | 'case_study'
  | 'news'
  | 'service'
  | 'white_paper'
  | 'challenge'
  | 'custom'

/**
 * What `resolveCtaLabel` reduces to internally. `default` is the
 * neutral "Read more" fallback used for external/unknown URLs.
 */
type ResolvedKind =
  | 'article'
  | 'case_study'
  | 'news'
  | 'service'
  | 'white_paper'
  | 'challenge'
  | 'default'

const LABELS: Record<ResolvedKind, Record<Locale, string>> = {
  article: {
    en: 'Read our article',
    fr: 'Lire notre article',
    nl: 'Lees ons artikel',
  },
  case_study: {
    en: 'Read our case study',
    fr: 'Lire notre étude de cas',
    nl: 'Lees onze case study',
  },
  news: {
    en: 'Read this news',
    fr: 'Lire cette actualité',
    nl: 'Lees dit nieuws',
  },
  service: {
    en: 'Discover this service',
    fr: 'Découvrir ce service',
    nl: 'Ontdek deze dienst',
  },
  white_paper: {
    en: 'Read our white paper',
    fr: 'Lire notre livre blanc',
    nl: 'Lees onze whitepaper',
  },
  challenge: {
    en: 'Read this challenge',
    fr: 'Lire ce défi',
    nl: 'Lees deze uitdaging',
  },
  default: {
    en: 'Read more',
    fr: 'En savoir plus',
    nl: 'Lees meer',
  },
}

/**
 * URL → kind, used when the editor leaves the kind on `auto`. Note
 * /resources/{slug} is shared by articles AND case studies; pattern
 * matching alone can't distinguish them, so it falls back to `article`.
 * Editors can override via `case_study` when needed.
 */
export function inferCtaKindFromHref(href: string | null | undefined): ResolvedKind {
  const trimmed = (href ?? '').trim()
  if (!trimmed) return 'default'
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return 'default'
  if (trimmed.startsWith('/news/')) return 'news'
  if (trimmed.startsWith('/services/')) return 'service'
  if (trimmed.startsWith('/challenges/')) return 'challenge'
  if (trimmed.startsWith('/resources/white-papers')) return 'white_paper'
  if (
    trimmed === '/resources/case-studies' ||
    trimmed.startsWith('/resources/case-studies/')
  ) {
    return 'case_study'
  }
  if (trimmed.startsWith('/resources/')) return 'article'
  return 'default'
}

/**
 * Resolve the public-facing label for a CTA given its kind, href, locale
 * and (when kind === 'custom') the editor-provided LocaleString.
 */
export function resolveCtaLabel(
  kind: CtaKindChoice | undefined,
  href: string | null | undefined,
  locale: Locale = 'en',
  customLabel?: LocaleString,
): string {
  if (kind === 'custom') {
    const localized = customLabel ? getLocalizedField(customLabel, locale) : ''
    return localized || LABELS.default[locale]
  }
  const resolved: ResolvedKind =
    !kind || kind === 'auto' ? inferCtaKindFromHref(href) : kind
  return LABELS[resolved][locale]
}

export const CTA_KIND_CHOICES: CtaKindChoice[] = [
  'auto',
  'article',
  'case_study',
  'news',
  'service',
  'white_paper',
  'challenge',
  'custom',
]

export const CTA_KIND_LABELS: Record<CtaKindChoice, string> = {
  auto: 'Auto (from URL)',
  article: 'Article',
  case_study: 'Case Study',
  news: 'News',
  service: 'Service',
  white_paper: 'White Paper',
  challenge: 'Challenge',
  custom: 'Custom…',
}
