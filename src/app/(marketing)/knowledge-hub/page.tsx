import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Video, FileDown } from 'lucide-react'
import { getPublishedArticles } from '@/lib/firestore/articles'
import { getPublishedWhitePapers } from '@/lib/firestore/white-papers'
import { getLocalizedField } from '@/lib/locale'
import { formatDate } from '@/lib/utils/date'
import Badge from '@/components/ui/Badge'
import VlogCard from '@/components/ui/VlogCard'
import WhitePaperCard from '@/components/ui/WhitePaperCard'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Knowledge Hub',
  description: 'Resources, vlogs, white papers, and expert insights on business continuity, disaster recovery, and cyber resilience.',
  alternates: { canonical: 'https://coin-bc.com/knowledge-hub' },
  openGraph: {
    title: 'Knowledge Hub | COIN AS',
    description: 'Resources, vlogs, white papers, and expert insights on business continuity, disaster recovery, and cyber resilience.',
    url: 'https://coin-bc.com/knowledge-hub',
  },
}

export default async function KnowledgeHubPage() {
  const [allArticles, whitePapers] = await Promise.all([
    getPublishedArticles(),
    getPublishedWhitePapers(),
  ])

  const articles = allArticles.filter((a) => a.category !== 'vlog')
  const vlogs = allArticles.filter((a) => a.category === 'vlog')
  const caseStudies = allArticles.filter((a) => a.category === 'case_study')
  const resources = allArticles.filter((a) => a.category === 'resource')

  const tabs = [
    { id: 'articles', label: 'Articles', icon: BookOpen, count: articles.length },
    { id: 'vlog', label: 'Vlog', icon: Video, count: vlogs.length },
    { id: 'white-papers', label: 'White Papers', icon: FileDown, count: whitePapers.length },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 text-white py-20">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative container-padding max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-accent-400 font-semibold text-sm uppercase tracking-widest mb-3">
              Resources
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Knowledge Hub</h1>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              Expert insights, video guides, and downloadable resources on business continuity
              and cyber resilience.
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex justify-center gap-2 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <a
                  key={tab.id}
                  href={`#${tab.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-sm font-medium"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="bg-accent-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                      {tab.count}
                    </span>
                  )}
                </a>
              )
            })}
            <Link
              href="/knowledge-hub/faq"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-500 hover:bg-accent-600 transition-all text-sm font-semibold"
            >
              FAQ
            </Link>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section id="articles" className="py-16 scroll-mt-24">
        <div className="container-padding max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-6 w-6 text-primary-500" />
            <h2 className="text-3xl font-bold">Articles & Case Studies</h2>
          </div>

          {articles.length > 0 ? (
            <>
              {resources.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-slate-500 mb-5">Resources</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {resources.map((a) => <ArticleCard key={a.id} article={a} />)}
                  </div>
                </>
              )}
              {caseStudies.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-slate-500 mb-5">Case Studies</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {caseStudies.map((a) => <ArticleCard key={a.id} article={a} />)}
                  </div>
                </>
              )}
            </>
          ) : (
            <EmptyState
              icon={<BookOpen className="h-12 w-12 text-slate-300" />}
              message="No articles published yet. Check back soon."
            />
          )}
        </div>
      </section>

      {/* Vlog */}
      <section id="vlog" className="py-16 bg-slate-50 scroll-mt-24">
        <div className="container-padding max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Video className="h-6 w-6 text-primary-500" />
            <h2 className="text-3xl font-bold">Vlog</h2>
          </div>
          <p className="text-slate-500 mb-8">
            Video insights from our business continuity experts.
          </p>

          {vlogs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vlogs.map((v) => (
                <VlogCard key={v.id} article={v} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Video className="h-12 w-12 text-slate-300" />}
              message="Video content coming soon. Subscribe to our LinkedIn to be notified."
              cta={{ label: 'Follow us on LinkedIn', href: 'https://www.linkedin.com/company/coin-business-continuity/' }}
            />
          )}
        </div>
      </section>

      {/* White Papers */}
      <section id="white-papers" className="py-16 scroll-mt-24">
        <div className="container-padding max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <FileDown className="h-6 w-6 text-primary-500" />
            <h2 className="text-3xl font-bold">White Papers & Guides</h2>
          </div>
          <p className="text-slate-500 mb-8">
            In-depth guides and white papers. Free to download.
          </p>

          {whitePapers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {whitePapers.map((wp) => (
                <WhitePaperCard key={wp.id} paper={wp} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileDown className="h-12 w-12 text-slate-300" />}
              message="White papers and guides coming soon."
            />
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-primary-500 text-white">
        <div className="container-padding text-center">
          <h2 className="text-2xl font-bold mb-3">Need tailored advice?</h2>
          <p className="text-primary-100 mb-6 max-w-xl mx-auto">
            Our experts are available to discuss your specific business continuity challenges.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-primary-500 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Contact an expert
          </Link>
        </div>
      </section>
    </>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ArticleCard({ article }: { article: import('@/lib/types/article').Article }) {
  const title = getLocalizedField(article.title)
  const excerpt = getLocalizedField(article.excerpt)
  const slug = getLocalizedField(article.slug)
  const categoryLabel = article.category === 'case_study' ? 'Case Study' : 'Resource'

  return (
    <Link
      href={`/knowledge-hub/${slug}`}
      className="group block bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
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
          {article.publishedAt && (
            <span className="text-sm text-slate-500">{formatDate(article.publishedAt)}</span>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        {excerpt && <p className="text-slate-600 text-sm line-clamp-3">{excerpt}</p>}
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

function EmptyState({
  icon,
  message,
  cta,
}: {
  icon: React.ReactNode
  message: string
  cta?: { label: string; href: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon}
      <p className="mt-4 text-slate-500 max-w-sm">{message}</p>
      {cta && (
        <Link
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-primary-500 font-semibold hover:underline text-sm"
        >
          {cta.label}
        </Link>
      )}
    </div>
  )
}
