import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, FileText, Video, Newspaper, HelpCircle } from 'lucide-react'
import { getPublishedArticles } from '@/lib/firestore/articles'
import { getPublishedNews } from '@/lib/firestore/news'
import { getCoinYoutubeVideos } from '@/lib/youtube'
import { getLocalizedField } from '@/lib/locale'
import { formatDate } from '@/lib/utils/date'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import ArticleCard from '@/components/knowledge-hub/ArticleCard'
import type { NewsItem } from '@/lib/types/news'
import type { YoutubeVideo } from '@/lib/youtube'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Knowledge Hub',
  description: 'Articles, case studies, videos and news on business continuity, disaster recovery and cyber resilience.',
  alternates: { canonical: 'https://coin-bc.com/knowledge-hub' },
  openGraph: {
    title: 'Knowledge Hub | COIN AS',
    description: 'Articles, case studies, videos and news on business continuity, disaster recovery and cyber resilience.',
    url: 'https://coin-bc.com/knowledge-hub',
  },
}

export default async function KnowledgeHubOverview() {
  const [allArticles, news, videos] = await Promise.all([
    getPublishedArticles(),
    getPublishedNews(),
    getCoinYoutubeVideos(),
  ])

  const articles = allArticles.filter((a) => a.category === 'resource').slice(0, 3)
  const caseStudies = allArticles.filter((a) => a.category === 'case_study').slice(0, 3)
  const latestVideos = videos.slice(0, 3)
  const latestNews = news.slice(0, 3)

  const quickLinks = [
    { label: 'Articles', href: '#articles', count: articles.length },
    { label: 'Case Studies', href: '#case-studies', count: caseStudies.length },
    { label: 'Videos', href: '#videos', count: latestVideos.length },
    { label: 'News', href: '#news', count: latestNews.length },
    { label: 'FAQ', href: '/knowledge-hub/faq' },
  ]

  return (
    <>
      <HubBanner title="Knowledge Hub" quickLinks={quickLinks} />

      {/* Articles */}
      <SectionWrapper id="articles" icon={BookOpen} title="Articles" viewAllHref="/knowledge-hub/articles" bgClass="bg-white">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((a) => <ArticleCard key={a.id} article={a} variant="resource" />)}
          </div>
        ) : (
          <EmptyHint message="No articles yet." />
        )}
      </SectionWrapper>

      {/* Case Studies */}
      <SectionWrapper id="case-studies" icon={FileText} title="Case Studies" viewAllHref="/knowledge-hub/case-studies" bgClass="bg-warm-50">
        {caseStudies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudies.map((a) => <ArticleCard key={a.id} article={a} variant="case_study" />)}
          </div>
        ) : (
          <EmptyHint message="No case studies yet." />
        )}
      </SectionWrapper>

      {/* Videos */}
      <SectionWrapper id="videos" icon={Video} title="Videos" viewAllHref="/knowledge-hub/videos" bgClass="bg-white">
        {latestVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestVideos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        ) : (
          <EmptyHint message="No videos yet." />
        )}
      </SectionWrapper>

      {/* News */}
      <SectionWrapper id="news" icon={Newspaper} title="News" viewAllHref="/news" bgClass="bg-warm-50">
        {latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((n) => <NewsCard key={n.id} news={n} />)}
          </div>
        ) : (
          <EmptyHint message="No news yet." />
        )}
      </SectionWrapper>

      {/* FAQ link */}
      <section className="py-16 bg-primary-950 text-white">
        <div className="container-padding max-w-3xl mx-auto text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-accent-400" />
          <h2 className="text-3xl font-bold font-display mb-3">Got a question?</h2>
          <p className="text-primary-200 mb-6">
            Browse our frequently asked questions on business continuity, recovery and compliance.
          </p>
          <Link
            href="/knowledge-hub/faq"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors"
          >
            <span>Visit our FAQ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────

function SectionWrapper({
  id,
  icon: Icon,
  title,
  viewAllHref,
  bgClass,
  children,
}: {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  viewAllHref: string
  bgClass: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={`py-16 scroll-mt-24 ${bgClass}`}>
      <div className="container-padding max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Icon className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-primary-900 font-display">{title}</h2>
            </div>
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {children}
        <div className="mt-8 sm:hidden">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function EmptyHint({ message }: { message: string }) {
  return <p className="text-secondary-400 text-sm italic">{message}</p>
}

function VideoCard({ video }: { video: YoutubeVideo }) {
  return (
    <a
      href={video.watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:shadow-lg transition-all"
    >
      <div className="relative aspect-video bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-primary-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
          {video.title}
        </h3>
      </div>
    </a>
  )
}

function NewsCard({ news }: { news: NewsItem }) {
  const title = getLocalizedField(news.title)
  const excerpt = getLocalizedField(news.excerpt)
  const slug = getLocalizedField(news.slug)
  return (
    <Link
      href={`/news/${slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      {news.imageUrl && (
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary-100">
          <Image src={news.imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        {news.publishedAt && (
          <span className="text-xs text-secondary-400 uppercase tracking-wider font-medium mb-2">
            {formatDate(news.publishedAt)}
          </span>
        )}
        <h3 className="font-bold text-primary-900 font-display leading-snug mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {title}
        </h3>
        {excerpt && <p className="text-secondary-600 text-sm line-clamp-2">{excerpt}</p>}
      </div>
    </Link>
  )
}
