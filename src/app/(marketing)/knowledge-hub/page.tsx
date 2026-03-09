import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedArticles } from '@/lib/firestore/articles'
import { getLocalizedField } from '@/lib/locale'
import { formatDate } from '@/lib/utils/date'
import Badge from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Knowledge Hub',
  description: 'Resources, case studies, and insights on business continuity, disaster recovery, and cyber resilience.',
}

export default async function KnowledgeHubPage() {
  const allArticles = await getPublishedArticles()

  const resources = allArticles.filter((a) => a.category === 'resource')
  const caseStudies = allArticles.filter((a) => a.category === 'case_study')

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
        <div className="relative container-padding max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Knowledge Hub</h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Resources, case studies, and expert insights on business continuity and cyber resilience.
          </p>
          <div className="mt-6">
            <Link
              href="/knowledge-hub/faq"
              className="inline-block text-white underline underline-offset-4 hover:text-primary-200 transition-colors"
            >
              Visit our FAQ
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      {resources.length > 0 && (
        <section className="py-16">
          <div className="container-padding max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Case Studies Section */}
      {caseStudies.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-padding max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Case Studies</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {allArticles.length === 0 && (
        <section className="py-20">
          <div className="container-padding max-w-6xl mx-auto text-center">
            <p className="text-gray-500 text-lg">No articles available at the moment.</p>
          </div>
        </section>
      )}
    </>
  )
}

function ArticleCard({ article }: { article: import('@/lib/types/article').Article }) {
  const title = getLocalizedField(article.title)
  const excerpt = getLocalizedField(article.excerpt)
  const slug = getLocalizedField(article.slug)
  const categoryLabel = article.category === 'case_study' ? 'Case Study' : 'Resource'

  return (
    <Link
      href={`/knowledge-hub/${slug}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {article.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="text-xs">{categoryLabel}</Badge>
          <span className="text-sm text-gray-500">
            {formatDate(article.publishedAt)}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        {excerpt && (
          <p className="text-gray-600 text-sm line-clamp-3">{excerpt}</p>
        )}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="accent" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
