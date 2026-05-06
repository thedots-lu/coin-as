import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { formatDate } from '@/lib/utils/date'
import Badge from '@/components/ui/Badge'
import type { Article, ArticleAccentColor } from '@/lib/types/article'
import { DEFAULT_ARTICLE_ACCENT_COLOR } from '@/lib/types/article'

interface ArticleCardProps {
  article: Article
  variant?: 'resource' | 'case_study'
}

const ACCENT_STRIP_BG: Record<ArticleAccentColor, string> = {
  green: 'bg-accent-500',
  red: 'bg-coin-red-500',
  navy: 'bg-primary-500',
  slate: 'bg-secondary-500',
}

export default function ArticleCard({ article, variant = 'resource' }: ArticleCardProps) {
  const title = getLocalizedField(article.title)
  const excerpt = getLocalizedField(article.excerpt)
  const slug = getLocalizedField(article.slug)
  const label = variant === 'case_study' ? 'Case Study' : 'Article'
  const accent = ACCENT_STRIP_BG[article.accentColor ?? DEFAULT_ARTICLE_ACCENT_COLOR]

  return (
    <Link
      href={`/resources/${slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      {variant === 'case_study' ? (
        <div className={`h-1.5 ${accent}`} aria-hidden />
      ) : article.imageUrl ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary-100">
          <Image
            src={article.imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div className="relative aspect-[16/10] bg-warm-50 flex items-center justify-center">
          <Image
            src="/images/coin/coin-logo-header.png"
            alt="COIN"
            width={160}
            height={48}
            className="opacity-80 max-w-[60%] h-auto object-contain"
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={variant === 'case_study' ? 'accent' : 'default'} className="text-xs">
            {label}
          </Badge>
          {article.publishedAt && (
            <span className="text-xs text-secondary-400 uppercase tracking-wider font-medium">
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-primary-900 font-display leading-snug mb-3 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        {excerpt && (
          <p className="text-secondary-600 text-sm leading-relaxed line-clamp-3 mb-4">
            {excerpt}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 group-hover:text-primary-800 mt-auto pt-2">
          <span>Read more</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
