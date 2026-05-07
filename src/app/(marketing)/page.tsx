import { Metadata } from 'next'
import { getPage } from '@/lib/firestore/pages'
import { getPublishedTestimonials } from '@/lib/firestore/testimonials'
import { getVisibleCustomerLogos } from '@/lib/firestore/customer-logos'
import { generatePageMetadata } from '@/lib/utils/metadata'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('home')
  return generatePageMetadata(page?.seo, page?.title, { path: '/' })
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
    <PageSectionRenderer
      sections={visibleSections}
      testimonials={testimonials}
      customerLogos={customerLogos}
    />
  )
}
