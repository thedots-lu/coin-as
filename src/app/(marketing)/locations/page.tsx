import { getPage } from '@/lib/firestore/pages'
import { getPublishedSites } from '@/lib/firestore/sites'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('locations')
  if (!page) return { title: 'Locations' }
  return generatePageMetadata(page.seo, page.title, { path: '/locations' })
}

export default async function LocationsPage() {
  const [pageData, sites] = await Promise.all([
    getPage('locations'),
    getPublishedSites(),
  ])

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Page not found</p>
      </div>
    )
  }

  return <PageSectionRenderer sections={pageData.sections} sites={sites} />
}
