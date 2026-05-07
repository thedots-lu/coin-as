import { Metadata } from 'next'
import { getPublishedArticles } from '@/lib/firestore/articles'
import { getPage } from '@/lib/firestore/pages'
import { generatePageMetadata } from '@/lib/utils/metadata'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import TagFilterGrid from '@/components/knowledge-hub/TagFilterGrid'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('case-studies')
  return generatePageMetadata(page?.seo, page?.title, {
    path: '/resources/case-studies',
  })
}

export default async function CaseStudiesPage() {
  const [all, pageData] = await Promise.all([
    getPublishedArticles(),
    getPage('case-studies'),
  ])
  const cases = all.filter((a) => a.category === 'case_study')

  return (
    <>
      <HubBanner title="Case Studies" backToHub />
      {pageData?.sections && pageData.sections.length > 0 && (
        <PageSectionRenderer sections={pageData.sections} />
      )}
      <section className="pb-12 md:pb-16 bg-white">
        <div className="container-padding max-w-6xl mx-auto">
          <TagFilterGrid articles={cases} variant="case_study" />
        </div>
      </section>
    </>
  )
}
