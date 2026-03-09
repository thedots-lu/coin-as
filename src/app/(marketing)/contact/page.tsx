import { getPage } from '@/lib/firestore/pages'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('contact')
  if (!page) return { title: 'Contact Us' }
  return generatePageMetadata(page.seo, page.title)
}

export default async function ContactPage() {
  const pageData = await getPage('contact')

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-500">Contact page is being set up. Please check back soon.</p>
        </div>
      </div>
    )
  }

  return <PageSectionRenderer sections={pageData.sections} />
}
