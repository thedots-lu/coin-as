import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedNews } from '@/lib/firestore/news'
import { getLocalizedField } from '@/lib/locale'
import { formatDate } from '@/lib/utils/date'
import Badge from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'News & Events',
  description: 'Stay up to date with the latest news and events from COIN, your business continuity partner.',
}

export default async function NewsPage() {
  const allNews = await getPublishedNews()

  const newsItems = allNews.filter((item) => item.type === 'news')
  const eventItems = allNews.filter((item) => item.type === 'event')

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
        <div className="relative container-padding max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">News & Events</h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            The latest updates on business continuity, cyber resilience, and COIN activities.
          </p>
        </div>
      </section>

      {/* News Section */}
      {newsItems.length > 0 && (
        <section className="py-16">
          <div className="container-padding max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">News</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((item) => {
                const title = getLocalizedField(item.title)
                const excerpt = getLocalizedField(item.excerpt)
                const slug = getLocalizedField(item.slug)

                return (
                  <Link
                    key={item.id}
                    href={`/news/${slug}`}
                    className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {item.imageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-500">
                          {formatDate(item.publishedAt)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                        {title}
                      </h3>
                      {excerpt && (
                        <p className="text-gray-600 text-sm line-clamp-3">{excerpt}</p>
                      )}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      {eventItems.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-padding max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventItems.map((item) => {
                const title = getLocalizedField(item.title)
                const excerpt = getLocalizedField(item.excerpt)
                const slug = getLocalizedField(item.slug)
                const location = item.eventLocation
                  ? getLocalizedField(item.eventLocation)
                  : ''

                return (
                  <Link
                    key={item.id}
                    href={`/news/${slug}`}
                    className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {item.imageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="accent" className="text-xs">Event</Badge>
                        {item.eventDate && (
                          <span className="text-sm text-gray-500">
                            {formatDate(item.eventDate)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                        {title}
                      </h3>
                      {location && (
                        <p className="text-sm text-gray-500 mb-2">{location}</p>
                      )}
                      {excerpt && (
                        <p className="text-gray-600 text-sm line-clamp-3">{excerpt}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {allNews.length === 0 && (
        <section className="py-20">
          <div className="container-padding max-w-6xl mx-auto text-center">
            <p className="text-gray-500 text-lg">No news or events available at the moment.</p>
          </div>
        </section>
      )}
    </>
  )
}
