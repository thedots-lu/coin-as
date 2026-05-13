import { getPublishedServices, getServiceBySlug } from '@/lib/firestore/services'
import { getLocalizedField } from '@/lib/locale'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  const overview = await getServiceBySlug('overview')
  return generatePageMetadata(overview?.seo, overview?.title, { path: '/services' })
}

export default async function ServicesPage() {
  const [overview, services] = await Promise.all([
    getServiceBySlug('overview'),
    getPublishedServices(),
  ])

  if (!overview) notFound()

  // Auto-derived quick links from published services (excluding the overview itself).
  const quickLinks = services
    .filter((s) => (s.slug ?? s.id) !== 'overview')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s) => ({
      label: getLocalizedField(s.card?.title, 'en') || getLocalizedField(s.title, 'en'),
      href: `/services/${s.slug ?? s.id}`,
    }))

  return (
    <>
      <HubBanner title={getLocalizedField(overview.title, 'en') || 'Our Services'} quickLinks={quickLinks} />
      <PageSectionRenderer sections={overview.sections ?? []} services={services} />
    </>
  )
}
