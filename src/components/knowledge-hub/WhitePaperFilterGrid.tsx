'use client'

import { useState, useMemo } from 'react'
import WhitePaperCard from '@/components/ui/WhitePaperCard'
import type { WhitePaper } from '@/lib/types/article'

interface Props {
  papers: WhitePaper[]
}

type SortMode = 'newest' | 'oldest'

export default function WhitePaperFilterGrid({ papers }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sort, setSort] = useState<SortMode>('newest')

  const allCategories = useMemo(() => {
    const set = new Set<string>()
    papers.forEach((p) => p.category && set.add(p.category))
    return Array.from(set).sort()
  }, [papers])

  const filtered = useMemo(() => {
    let result = papers
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory)
    }
    return [...result].sort((a, b) => {
      const da = getTime(a.publishedAt)
      const db = getTime(b.publishedAt)
      return sort === 'newest' ? db - da : da - db
    })
  }, [papers, activeCategory, sort])

  if (papers.length === 0) {
    return <p className="text-secondary-500 text-center py-12">No white papers yet.</p>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        {allCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeCategory === null
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-secondary-200 text-secondary-600 hover:border-primary-500'
              }`}
            >
              All ({papers.length})
            </button>
            {allCategories.map((cat) => {
              const count = papers.filter((p) => p.category === cat).length
              const label = cat.replace(/_/g, ' ')
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeCategory === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-secondary-200 text-secondary-600 hover:border-primary-500'
                  }`}
                >
                  {label} ({count})
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

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => <WhitePaperCard key={p.id} paper={p} />)}
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
