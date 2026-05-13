import { getPage } from '@/lib/firestore/pages'
import { getPublishedTeamMembers } from '@/lib/firestore/team'
import { getPublishedPartners } from '@/lib/firestore/partners'
import { getVisibleCustomerLogos } from '@/lib/firestore/customer-logos'
import { getPublishedSites } from '@/lib/firestore/sites'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'
import HubBanner from '@/components/knowledge-hub/HubBanner'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('about')
  if (!page) return { title: 'About Us' }
  return generatePageMetadata(page.seo, page.title, { path: '/about' })
}

export default async function AboutPage() {
  const [pageData, teamMembers, partners, logosFromDb, sites] = await Promise.all([
    getPage('about'),
    getPublishedTeamMembers(),
    getPublishedPartners(),
    getVisibleCustomerLogos(),
    getPublishedSites(),
  ])

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Page not found</p>
      </div>
    )
  }

  // hero_simple is handled by HubBanner; the mission section keeps its
  // heading/body but its lifecycle diagram has been moved to the Services page.
  const sections = pageData.sections.filter((s) => s.type !== 'hero_simple')

  const quickLinks = [
    { label: 'Our Values', href: '#values' },
    { label: 'Our Experts', href: '#teams' },
    { label: 'Our Partners', href: '#partners' },
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
        customerLogos={logosFromDb.map((l) => ({ url: l.imageUrl, name: l.name }))}
        sites={sites}
      />
    </>
  )
}
