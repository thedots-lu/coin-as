import { collection, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { Site } from '../types/site'
import { LocaleString } from '../types/locale'
import { serializeFirestoreData } from './serialize'
import { generateSlug } from '../utils/slug'
import { getLocalizedField } from '../locale'

export async function getPublishedSites(): Promise<Site[]> {
  try {
    const snapshot = await getDocs(collection(db, 'sites'))
    const items = snapshot.docs.map((d) =>
      serializeFirestoreData<Site>({ id: d.id, ...d.data() }),
    )
    return items
      .filter((s) => s.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (error) {
    console.error('Error fetching sites:', error)
    return []
  }
}

/**
 * Slug used for /locations/<slug>. Reads the stored `slug` field if set,
 * otherwise derives one from `name.en`. Kept in sync with the rule used by
 * the migration script so legacy docs without `slug` resolve the same URL.
 */
export function siteSlug(site: Pick<Site, 'slug' | 'name' | 'id'>): string {
  if (site.slug && site.slug.trim()) return site.slug
  const enName = getLocalizedField(site.name, 'en')
  return enName ? generateSlug(enName) : site.id
}

export async function getSiteBySlug(slug: string): Promise<Site | null> {
  const all = await getPublishedSites()
  return all.find((s) => siteSlug(s) === slug) ?? null
}

/**
 * Effective body text for the per-site detail page intro card and for the
 * cards in the "Explore our other locations" carousel. Each locale falls back
 * to the matching `description` locale when `detailDescription` is empty, so
 * editors can leave detailDescription blank to inherit the overview copy.
 */
export function siteDetailDescription(site: Site): LocaleString {
  const detail = site.detailDescription
  const base = site.description
  return {
    en: (detail?.en && detail.en.trim()) ? detail.en : (base?.en ?? ''),
    fr: (detail?.fr && detail.fr.trim()) ? detail.fr : (base?.fr ?? ''),
    nl: (detail?.nl && detail.nl.trim()) ? detail.nl : (base?.nl ?? ''),
  }
}
