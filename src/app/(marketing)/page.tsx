import { Metadata } from 'next'
import { getPage } from '@/lib/firestore/pages'
import { getPublishedTestimonials } from '@/lib/firestore/testimonials'
import { getVisibleCustomerLogos } from '@/lib/firestore/customer-logos'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'
import NewsletterPopup from '@/components/NewsletterPopup'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Business Continuity & Cyber Resilience Solutions | COIN',
  description: 'COIN AS, BeNeLux leader in business continuity for over 20 years. Recovery workplaces, BCP consulting, DORA & NIS2 compliance, cyber resilience.',
  alternates: { canonical: 'https://coin-bc.com' },
  openGraph: {
    title: 'Business Continuity & Cyber Resilience | COIN AS BeNeLux',
    description: 'Over 20 years of expertise in business continuity. 750+ recovery workplaces across Belgium, Netherlands and Luxembourg.',
    url: 'https://coin-bc.com',
    type: 'website',
  },
}

export default async function HomePage() {
  const [pageData, testimonials, logosFromDb] = await Promise.all([
    getPage('home'),
    getPublishedTestimonials(),
    getVisibleCustomerLogos(),
  ])

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const visibleSections = pageData.sections.filter((s) => s.type !== 'innovation')
  const customerLogos = logosFromDb.map((l) => ({ url: l.imageUrl, name: l.name }))

  return (
    <>
      <PageSectionRenderer
        sections={visibleSections}
        testimonials={testimonials}
        customerLogos={customerLogos}
      />
      <NewsletterPopup />
    </>
  )
}
