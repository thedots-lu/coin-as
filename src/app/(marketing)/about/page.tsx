import { getPage } from '@/lib/firestore/pages'
import { getPublishedTeamMembers } from '@/lib/firestore/team'
import { getPublishedPartners } from '@/lib/firestore/partners'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'
import HubBanner from '@/components/knowledge-hub/HubBanner'

export const revalidate = 300

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

  // Filter out hero_simple — we use the minimal HubBanner instead
  const sections = pageData.sections.filter((s) => s.type !== 'hero_simple')

  const quickLinks = [
    { label: 'Our Mission', href: '#mission' },
    { label: 'Our Values', href: '#values' },
    { label: 'Our Experts', href: '#teams' },
    { label: 'Our Customers', href: '#customers' },
    { label: 'Our Locations', href: '#locations' },
    { label: 'Our History', href: '#history' },
  ]

  return (
    <>
      <HubBanner title="About COIN" quickLinks={quickLinks} />
      <PageSectionRenderer
        sections={sections}
        teamMembers={teamMembers}
        partners={partners}
      />
    </>
  )
}
