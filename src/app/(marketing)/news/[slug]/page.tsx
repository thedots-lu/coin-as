import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getNewsBySlug } from '@/lib/firestore/news'
import { getLocalizedField } from '@/lib/locale'
import { formatDate } from '@/lib/utils/date'
import { isHtml, sanitizeRichHtml } from '@/lib/utils/html'
import Badge from '@/components/ui/Badge'

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await getNewsBySlug(slug)
  if (!item) return { title: 'News Not Found' }

  const title = getLocalizedField(item.title)
  const excerpt = getLocalizedField(item.excerpt)

  return {
    title: `${title} | COIN`,
    description: excerpt || title,
    openGraph: {
      title,
      description: excerpt,
      images: item.imageUrl ? [item.imageUrl] : [],
    },
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await getNewsBySlug(slug)

  if (!item) {
    notFound()
  }

  const title = getLocalizedField(item.title)
  const content = getLocalizedField(item.content)
  const location = item.eventLocation
    ? getLocalizedField(item.eventLocation)
    : ''

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
        <div className="relative container-padding max-w-4xl mx-auto">
          <Link
            href="/news"
            className="inline-flex items-center text-primary-200 hover:text-white mb-6 transition-colors"
          >
            &larr; Back to News
          </Link>
          <div className="flex items-center gap-3 mb-4">
            {item.type === 'event' && (
              <Badge variant="accent">Event</Badge>
            )}
            <span className="text-primary-200 text-sm">
              {formatDate(item.publishedAt)}
            </span>
            {item.author && (
              <span className="text-primary-200 text-sm">
                by {item.author}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
          {item.type === 'event' && (
            <div className="mt-4 flex flex-wrap gap-4 text-primary-100 text-sm">
              {item.eventDate && (
                <span>Date: {formatDate(item.eventDate)}</span>
              )}
              {location && <span>Location: {location}</span>}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-padding max-w-4xl mx-auto">
          {item.imageUrl && (
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-10">
              <Image
                src={item.imageUrl}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {isHtml(content) ? (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }}
            />
          ) : (
            <div className="prose prose-lg max-w-none" style={{ whiteSpace: 'pre-line' }}>
              {content}
            </div>
          )}

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-slate-200">
              {item.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}

          <div className="mt-10">
            <Link
              href="/news"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              &larr; Back to all news
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

