import { getPage } from '@/lib/firestore/pages'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('locations')
  if (!page) return { title: 'Locations' }
  return generatePageMetadata(page.seo, page.title)
}

export default async function LocationsPage() {
  const pageData = await getPage('locations')

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Page not found</p>
      </div>
    )
  }

  return <PageSectionRenderer sections={pageData.sections} />
}
