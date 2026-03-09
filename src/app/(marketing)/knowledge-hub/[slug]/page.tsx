import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPublishedArticles, getArticleBySlug } from '@/lib/firestore/articles'
import { getLocalizedField } from '@/lib/locale'
import { formatDate } from '@/lib/utils/date'
import Badge from '@/components/ui/Badge'

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = await getPublishedArticles()
  return articles.map((article) => ({
    slug: getLocalizedField(article.slug),
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Article Not Found' }

  const title = getLocalizedField(article.title)
  const excerpt = getLocalizedField(article.excerpt)

  return {
    title: `${title} | COIN`,
    description: excerpt || title,
    openGraph: {
      title,
      description: excerpt,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const title = getLocalizedField(article.title)
  const content = getLocalizedField(article.content)
  const categoryLabel = article.category === 'case_study' ? 'Case Study' : 'Resource'

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
        <div className="relative container-padding max-w-4xl mx-auto">
          <Link
            href="/knowledge-hub"
            className="inline-flex items-center text-primary-200 hover:text-white mb-6 transition-colors"
          >
            &larr; Back to Knowledge Hub
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Badge>{categoryLabel}</Badge>
            <span className="text-primary-200 text-sm">
              {formatDate(article.publishedAt)}
            </span>
            {article.author && (
              <span className="text-primary-200 text-sm">
                by {article.author}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-padding max-w-4xl mx-auto">
          {article.imageUrl && (
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-10">
              <Image
                src={article.imageUrl}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none" style={{ whiteSpace: 'pre-line' }}>
            {content}
          </div>

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-200">
              {article.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}

          <div className="mt-10">
            <Link
              href="/knowledge-hub"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              &larr; Back to Knowledge Hub
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
