import { Metadata } from 'next'
import { getPublishedArticles } from '@/lib/firestore/articles'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import TagFilterGrid from '@/components/knowledge-hub/TagFilterGrid'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Case Studies',
  description: 'Real customer success stories on business continuity and disaster recovery solutions.',
  alternates: { canonical: 'https://coin-bc.com/resources/case-studies' },
}

export default async function CaseStudiesPage() {
  const all = await getPublishedArticles()
  const cases = all.filter((a) => a.category === 'case_study')

  return (
    <>
      <HubBanner title="Case Studies" backToHub />
      <section className="py-12 md:py-16 bg-white">
        <div className="container-padding max-w-6xl mx-auto">
          <div className="max-w-4xl mb-12">
            <div className="w-12 h-1 bg-accent-500 rounded-full mb-4" />
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight mb-6">
              You can&rsquo;t plan the unexpected but you can get prepared to respond.
            </h2>
            <div className="space-y-4 text-secondary-700 leading-relaxed">
              <p>
                Our experience shows that, in most cases, the events that actually disrupt business operations are not major incidents such as a fire or a major cyberattack &ndash; for which numerous preventive measures are put in place &ndash; but rather more trivial situations that, unfortunately, occur more frequently.
              </p>
              <p>
                These situations range from flooding following a storm caused by a blocked roof drain to an internet connection failure due to roadworks, as well as prolonged breakdowns of the heating system due to a lack of spare parts, leaks in air-conditioning systems, or incidents blocking access to the street. In such circumstances, homeworking can help to manage the situation during the initial hours, depending on the type of business, but often does not provide an adequate solution when resolving the problem takes several days or even many weeks.
              </p>
              <p>
                We share below some examples of real-life events and how our customer and COIN dealt with it.
              </p>
              <p>
                COIN customers are also entitled to use our services for situations which, although planned, nonetheless disrupt business operations and require temporary alternative facilities offering the same level of security and redundancy of their primary office. Examples include building works, urgent maintenance, relocations, major projects or hosting large audits teams.
              </p>
            </div>
          </div>
          <TagFilterGrid articles={cases} variant="case_study" />
        </div>
      </section>
    </>
  )
}
