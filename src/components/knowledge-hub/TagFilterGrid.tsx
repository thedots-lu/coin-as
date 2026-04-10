'use client'

import { useState, useMemo } from 'react'
import ArticleCard from '@/components/knowledge-hub/ArticleCard'
import type { Article } from '@/lib/types/article'

interface TagFilterGridProps {
  articles: Article[]
  variant: 'resource' | 'case_study'
}

type SortMode = 'newest' | 'oldest'

export default function TagFilterGrid({ articles, variant }: TagFilterGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [sort, setSort] = useState<SortMode>('newest')

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => a.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [articles])

  // Filter + sort
  const filtered = useMemo(() => {
    let result = articles
    if (activeTag) {
      result = result.filter((a) => a.tags.includes(activeTag))
    }
    return [...result].sort((a, b) => {
      const da = getTime(a.publishedAt)
      const db = getTime(b.publishedAt)
      return sort === 'newest' ? db - da : da - db
    })
  }, [articles, activeTag, sort])

  if (articles.length === 0) {
    return <p className="text-secondary-500 text-center py-12">No content yet.</p>
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTag === null
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-secondary-200 text-secondary-600 hover:border-primary-500'
              }`}
            >
              All ({articles.length})
            </button>
            {allTags.map((tag) => {
              const count = articles.filter((a) => a.tags.includes(tag)).length
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeTag === tag
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-secondary-200 text-secondary-600 hover:border-primary-500'
                  }`}
                >
                  {tag} ({count})
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Sort:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="px-3 py-1.5 rounded-lg border border-secondary-200 bg-white text-sm font-medium text-secondary-700 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} variant={variant} />
          ))}
        </div>
      ) : (
        <p className="text-secondary-500 text-center py-12">No results for this filter.</p>
      )}
    </div>
  )
}

function getTime(d: unknown): number {
  if (!d) return 0
  if (d instanceof Date) return d.getTime()
  if (typeof d === 'object' && d !== null && 'seconds' in d) {
    return (d as { seconds: number }).seconds * 1000
  }
  return 0
}
