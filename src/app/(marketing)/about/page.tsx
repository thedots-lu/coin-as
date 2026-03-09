import { getPage } from '@/lib/firestore/pages'
import { getPublishedTeamMembers } from '@/lib/firestore/team'
import { getPublishedPartners } from '@/lib/firestore/partners'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('about')
  if (!page) return { title: 'About Us' }
  return generatePageMetadata(page.seo, page.title)
}

export default async function AboutPage() {
  const [pageData, teamMembers, partners] = await Promise.all([
    getPage('about'),
    getPublishedTeamMembers(),
    getPublishedPartners(),
  ])

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Page not found</p>
      </div>
    )
  }

  return (
    <PageSectionRenderer
      sections={pageData.sections}
      teamMembers={teamMembers}
      partners={partners}
    />
  )
}
