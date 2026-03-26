'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileText, Download, Loader2 } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { incrementDownloadCount } from '@/lib/firestore/white-papers'
import type { WhitePaper } from '@/lib/types/article'
import type { Locale } from '@/lib/types/locale'

interface WhitePaperCardProps {
  paper: WhitePaper
  locale?: Locale
}

const categoryLabels: Record<string, string> = {
  cyber_resilience: 'Cyber Resilience',
  business_continuity: 'Business Continuity',
  regulatory: 'Regulatory',
  case_study: 'Case Study',
  guide: 'Guide',
}

export default function WhitePaperCard({ paper, locale = 'en' }: WhitePaperCardProps) {
  const [downloading, setDownloading] = useState(false)
  const title = getLocalizedField(paper.title, locale)
  const description = getLocalizedField(paper.description, locale)
  const categoryLabel = categoryLabels[paper.category] ?? paper.category

  async function handleDownload() {
    if (!paper.fileUrl) return
    setDownloading(true)
    try {
      await incrementDownloadCount(paper.id)
      // Open file in new tab (triggers browser download for PDFs)
      window.open(paper.fileUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Thumbnail or placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
        {paper.thumbnailUrl ? (
          <Image src={paper.thumbnailUrl} alt={title} fill className="object-cover" />
        ) : (
          <FileText className="h-16 w-16 text-primary-200" />
        )}
        <span className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider bg-primary-500 text-white px-2.5 py-1 rounded-full">
          {categoryLabel}
        </span>
        {paper.pages && (
          <span className="absolute bottom-3 right-3 text-xs text-primary-400 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {paper.pages} pages
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-base mb-2 leading-snug">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 line-clamp-3 flex-1">{description}</p>
        )}

        {paper.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 mb-4">
            {paper.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !paper.fileUrl}
          className="mt-auto flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {downloading ? 'Preparing...' : 'Download PDF'}
        </button>
      </div>
    </div>
  )
}
