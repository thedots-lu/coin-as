import { getPage } from '@/lib/firestore/pages'
import { getPublishedTestimonials } from '@/lib/firestore/testimonials'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const revalidate = 300

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
