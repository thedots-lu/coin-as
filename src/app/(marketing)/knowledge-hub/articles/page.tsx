import { Metadata } from 'next'
import { getPublishedArticles } from '@/lib/firestore/articles'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import TagFilterGrid from '@/components/knowledge-hub/TagFilterGrid'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Articles and resources on business continuity, disaster recovery and cyber resilience.',
  alternates: { canonical: 'https://coin-bc.com/knowledge-hub/articles' },
}

export default async function ArticlesPage() {
  const all = await getPublishedArticles()
  const articles = all.filter((a) => a.category === 'resource')

  return (
    <>
      <HubBanner title="Articles" backToHub />
      <section className="py-12 md:py-16 bg-white">
        <div className="container-padding max-w-6xl mx-auto">
          <TagFilterGrid articles={articles} variant="resource" />
        </div>
      </section>
    </>
  )
}
