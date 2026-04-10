import { Metadata } from 'next'
import { getPublishedArticles } from '@/lib/firestore/articles'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import TagFilterGrid from '@/components/knowledge-hub/TagFilterGrid'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Case Studies',
  description: 'Real customer success stories on business continuity and disaster recovery solutions.',
  alternates: { canonical: 'https://coin-bc.com/knowledge-hub/case-studies' },
}

export default async function CaseStudiesPage() {
  const all = await getPublishedArticles()
  const cases = all.filter((a) => a.category === 'case_study')

  return (
    <>
      <HubBanner title="Case Studies" backToHub />
      <section className="py-12 md:py-16 bg-white">
        <div className="container-padding max-w-6xl mx-auto">
          <TagFilterGrid articles={cases} variant="case_study" />
        </div>
      </section>
    </>
  )
}
