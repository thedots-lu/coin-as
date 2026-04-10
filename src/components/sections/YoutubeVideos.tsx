'use client'

import { useState } from 'react'
import { Play, ExternalLink, Youtube } from 'lucide-react'
import type { YoutubeVideo } from '@/lib/youtube'
import { COIN_YOUTUBE_CHANNEL_URL } from '@/lib/youtube'

interface YoutubeVideosProps {
  videos: YoutubeVideo[]
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })
}

export default function YoutubeVideos({ videos }: YoutubeVideosProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500 mb-6">Videos coming soon.</p>
        <a
          href={COIN_YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-coin-red-500 text-white text-sm font-semibold hover:bg-coin-red-600 transition-colors"
        >
          <Youtube className="w-4 h-4" />
          Visit our YouTube channel
        </a>
      </div>
    )
  }

  return (
    <div>
      {/* Channel link at the top */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <p className="text-secondary-600 leading-relaxed max-w-xl">
          {videos.length} video{videos.length > 1 ? 's' : ''} from the COIN Business Continuity channel. Click any video to play it right here.
        </p>
        <a
          href={COIN_YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-coin-red-500 text-white text-sm font-semibold hover:bg-coin-red-600 transition-colors shrink-0 w-fit"
        >
          <Youtube className="w-4 h-4" />
          Subscribe on YouTube
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Videos grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => {
          const isActive = activeId === video.id

          return (
            <div
              key={video.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-secondary-100 hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              {/* Video player area */}
              <div className="relative aspect-video bg-black">
                {isActive ? (
                  <iframe
                    src={`${video.embedUrl}?autoplay=1&rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveId(video.id)}
                    className="absolute inset-0 w-full h-full group/thumb"
                    aria-label={`Play ${video.title}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover/thumb:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-coin-red-500 flex items-center justify-center shadow-2xl group-hover/thumb:scale-110 transition-transform duration-300">
                        <Play className="w-7 h-7 text-white fill-white ml-1" strokeWidth={2} />
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Video info */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-primary-900 font-display leading-snug mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-3 text-xs text-secondary-400">
                  <span className="uppercase tracking-wider font-medium">
                    {formatDate(video.publishedAt)}
                  </span>
                  <a
                    href={video.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-secondary-500 hover:text-coin-red-500 transition-colors"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
