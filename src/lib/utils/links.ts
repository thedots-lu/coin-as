/**
 * Detect whether a URL points outside the site. External URLs render as
 * <a target="_blank" rel="noopener noreferrer">; internal paths use next/link.
 */
export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return /^https?:\/\//i.test(url)
}

/**
 * Static list of internal routes admins commonly link to. Used as <datalist>
 * suggestions in the EditableLink picker. Dynamic routes (services/[slug],
 * articles/[slug], etc.) are not enumerated here; admins can paste those by
 * hand or type the slug.
 */
export const INTERNAL_ROUTES: ReadonlyArray<string> = [
  '/',
  '/about',
  '/contact',
  '/locations',
  '/services',
  '/services/consultancy-and-training',
  '/services/recovery-workplaces',
  '/services/crisis-management',
  '/services/it-housing',
  '/services/cyberresilience',
  '/partners',
  '/partners/become-partner',
  '/news',
  '/knowledge-hub',
  '/knowledge-hub/articles',
  '/knowledge-hub/case-studies',
  '/knowledge-hub/videos',
  '/knowledge-hub/faq',
  '/knowledge-hub/white-papers',
  '/cookies-policy',
  '/privacy-policy',
  '/legal-notice',
]
