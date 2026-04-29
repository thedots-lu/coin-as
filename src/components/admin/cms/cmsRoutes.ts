'use client'

import { collection, getDocs, query, where } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { INTERNAL_ROUTES } from '@/lib/utils/links'

export interface RouteEntry {
  /** Display label shown in the picker dropdown */
  label: string
  /** Final URL written into the field on selection */
  href: string
}

export interface RouteCategory {
  id: string
  label: string
  /** Resolves to all items belonging to this category */
  load: () => Promise<RouteEntry[]>
}

// ---- helpers ---------------------------------------------------------------

function extractSlug(slug: unknown): string {
  if (typeof slug === 'string') return slug
  if (slug && typeof slug === 'object' && 'en' in slug) {
    const v = (slug as { en?: unknown }).en
    return typeof v === 'string' ? v : ''
  }
  return ''
}

function extractTitle(title: unknown, fallback: string): string {
  if (typeof title === 'string' && title) return title
  if (title && typeof title === 'object') {
    const v = (title as { en?: unknown }).en
    if (typeof v === 'string' && v) return v
  }
  return fallback
}

const memoryCache = new Map<string, RouteEntry[]>()

async function cached(key: string, fetcher: () => Promise<RouteEntry[]>): Promise<RouteEntry[]> {
  if (memoryCache.has(key)) return memoryCache.get(key)!
  const items = await fetcher()
  memoryCache.set(key, items)
  return items
}

async function loadFromCollection(
  collectionName: string,
  hrefPrefix: string,
  options?: { onlyPublished?: boolean },
): Promise<RouteEntry[]> {
  const onlyPublished = options?.onlyPublished ?? true
  const q = onlyPublished
    ? query(collection(db, collectionName), where('published', '==', true))
    : query(collection(db, collectionName))
  const snap = await getDocs(q)
  const items = snap.docs
    .map((d) => {
      const data = d.data() as { slug?: unknown; title?: unknown }
      const slug = extractSlug(data.slug) || d.id
      const label = extractTitle(data.title, slug)
      return { label, href: `${hrefPrefix}/${slug}` }
    })
    .filter((it) => it.href.endsWith('/') === false)
  items.sort((a, b) => a.label.localeCompare(b.label))
  return items
}

// ---- categories ------------------------------------------------------------

const STATIC_PAGES: RouteEntry[] = INTERNAL_ROUTES.map((href) => ({
  label: href === '/' ? 'Home (/)' : href,
  href,
}))

export const ROUTE_CATEGORIES: RouteCategory[] = [
  {
    id: 'static',
    label: 'Static pages',
    load: async () => STATIC_PAGES,
  },
  {
    id: 'services',
    label: 'Services',
    load: () => cached('services', () => loadFromCollection('services', '/services')),
  },
  {
    id: 'news',
    label: 'News & events',
    load: () => cached('news', () => loadFromCollection('news', '/news')),
  },
  {
    id: 'knowledge-hub',
    label: 'Knowledge Hub (articles & case studies)',
    load: () =>
      cached('articles', () => loadFromCollection('articles', '/knowledge-hub')),
  },
  {
    id: 'challenges',
    label: 'Challenges',
    load: () => cached('challenges', () => loadFromCollection('challenges', '/challenges')),
  },
]

/** Look up a category by id (does not load). */
export function getCategory(id: string): RouteCategory | undefined {
  return ROUTE_CATEGORIES.find((c) => c.id === id)
}
