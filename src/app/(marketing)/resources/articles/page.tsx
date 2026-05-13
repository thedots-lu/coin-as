import { Metadata } from 'next'
import { getPublishedArticles } from '@/lib/firestore/articles'
import { getPage } from '@/lib/firestore/pages'
import { generatePageMetadata } from '@/lib/utils/metadata'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import TagFilterGrid from '@/components/knowledge-hub/TagFilterGrid'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('resources-articles')
  return generatePageMetadata(page?.seo, page?.title, {
    path: '/resources/articles',
  })
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
