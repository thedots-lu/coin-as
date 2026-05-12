import { collection, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { Site } from '../types/site'
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
