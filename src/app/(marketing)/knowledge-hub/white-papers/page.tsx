import { Metadata } from 'next'
import { getPublishedWhitePapers } from '@/lib/firestore/white-papers'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import WhitePaperFilterGrid from '@/components/knowledge-hub/WhitePaperFilterGrid'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'White Papers',
  description: 'In-depth guides and white papers on business continuity, disaster recovery and cyber resilience. Free to download.',
  alternates: { canonical: 'https://coin-bc.com/knowledge-hub/white-papers' },
}

export default async function WhitePapersPage() {
  const papers = await getPublishedWhitePapers()

  return (
    <>
      <HubBanner title="White Papers" backToHub />
      <section className="py-12 md:py-16 bg-white">
        <div className="container-padding max-w-6xl mx-auto">
          <WhitePaperFilterGrid papers={papers} />
        </div>
      </section>
    </>
  )
}
