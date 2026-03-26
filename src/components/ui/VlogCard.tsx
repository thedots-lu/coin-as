'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'
import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import type { Article } from '@/lib/types/article'
import type { Locale } from '@/lib/types/locale'
import { formatDate } from '@/lib/utils/date'

interface VlogCardProps {
  article: Article
  locale?: Locale
}

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
  return url
}

function getThumbnail(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
  return ''
}

export default function VlogCard({ article, locale = 'en' }: VlogCardProps) {
  const [playing, setPlaying] = useState(false)
  const title = getLocalizedField(article.title, locale)
  const excerpt = getLocalizedField(article.excerpt, locale)
  const videoUrl = article.videoUrl ?? ''
  const embedUrl = getEmbedUrl(videoUrl)
  const autoThumb = videoUrl ? getThumbnail(videoUrl) : ''
  const thumb = article.imageUrl || autoThumb

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Video area */}
      <div className="relative aspect-video bg-primary-950">
        {playing ? (
          <>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              title={title}
            />
            <button
              type="button"
              onClick={() => setPlaying(false)}
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
              aria-label="Close video"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            {thumb && (
              <Image src={thumb} alt={title} fill className="object-cover opacity-80" />
            )}
            <div className="absolute inset-0 bg-primary-950/40 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="group flex items-center justify-center w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                aria-label="Play video"
              >
                <Play className="h-6 w-6 text-primary-500 ml-1 group-hover:text-accent-500 transition-colors" fill="currentColor" />
              </button>
            </div>
            <span className="absolute bottom-2 left-3 text-xs font-bold uppercase tracking-wider text-accent-400 bg-black/50 px-2 py-0.5 rounded-full">
              Vlog
            </span>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
          {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          {article.author && <><span>·</span><span>{article.author}</span></>}
        </div>
        <h3 className="font-semibold text-base mb-2 leading-snug">{title}</h3>
        {excerpt && <p className="text-sm text-slate-500 line-clamp-2">{excerpt}</p>}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
