/**
 * Walk an arbitrary JSON-like value and collect every string that looks like
 * an absolute http(s) URL. Used by the visual CMS to diff before/after state
 * for orphan cleanup. Strings that are not URLs (or that point to non-R2 hosts)
 * are filtered out server-side by /api/upload's DELETE handler.
 */
export function extractUrls(value: unknown): Set<string> {
  const out = new Set<string>()
  walk(value, out)
  return out
}

function walk(value: unknown, out: Set<string>): void {
  if (value == null) return
  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value)) out.add(value)
    return
  }
  if (Array.isArray(value)) {
    for (const v of value) walk(v, out)
    return
  }
  if (typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) walk(v, out)
  }
}
