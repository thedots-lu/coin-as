import { Locale } from '@/lib/types/locale'

// Recursively walks an object/array tree, counting LocaleString leaves
// ({ en, fr, nl }) and how many are filled per locale.
export function computeLocaleStats(root: unknown): Array<{
  locale: Locale
  filled: number
  total: number
}> {
  const counts: Record<Locale, { filled: number; total: number }> = {
    en: { filled: 0, total: 0 },
    fr: { filled: 0, total: 0 },
    nl: { filled: 0, total: 0 },
  }

  function isLocaleString(v: unknown): v is { en: string; fr: string; nl: string } {
    if (!v || typeof v !== 'object') return false
    const o = v as Record<string, unknown>
    return (
      'en' in o &&
      'fr' in o &&
      'nl' in o &&
      (typeof o.en === 'string' || o.en === undefined) &&
      (typeof o.fr === 'string' || o.fr === undefined) &&
      (typeof o.nl === 'string' || o.nl === undefined)
    )
  }

  function walk(node: unknown) {
    if (node == null) return
    if (isLocaleString(node)) {
      ;(['en', 'fr', 'nl'] as Locale[]).forEach((l) => {
        counts[l].total++
        if ((node[l] ?? '').trim() !== '') counts[l].filled++
      })
      return
    }
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (typeof node === 'object') {
      Object.values(node as Record<string, unknown>).forEach(walk)
    }
  }

  walk(root)

  return (['en', 'fr', 'nl'] as Locale[]).map((locale) => ({
    locale,
    filled: counts[locale].filled,
    total: counts[locale].total,
  }))
}
