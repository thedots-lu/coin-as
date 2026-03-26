import { Metadata } from 'next'
import { getPage } from '@/lib/firestore/pages'
import { getPublishedTestimonials } from '@/lib/firestore/testimonials'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Business Continuity & Cyber Resilience Solutions | COIN',
  description: 'COIN AS — BeNeLux leader in business continuity for over 20 years. Recovery workplaces, BCP consulting, DORA & NIS2 compliance, cyber resilience.',
  alternates: { canonical: 'https://coin-bc.com' },
  openGraph: {
    title: 'Business Continuity & Cyber Resilience | COIN AS BeNeLux',
    description: 'Over 20 years of expertise in business continuity. 750+ recovery workplaces across Belgium, Netherlands and Luxembourg.',
    url: 'https://coin-bc.com',
    type: 'website',
  },
}

export default async function HomePage() {
  const [pageData, testimonials] = await Promise.all([
    getPage('home'),
    getPublishedTestimonials(),
  ])

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return <PageSectionRenderer sections={pageData.sections} testimonials={testimonials} />
}
