import { getPublishedServices, getServiceBySlug } from '@/lib/firestore/services'
import { getLocalizedField } from '@/lib/locale'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Services',
  description:
    'COIN business continuity services: consultancy & training, recovery workplaces, crisis management, IT housing, cyber resilience.',
  alternates: { canonical: 'https://coin-bc.com/services' },
  openGraph: {
    title: 'Our Services | COIN AS',
    description:
      'COIN business continuity services: consultancy & training, recovery workplaces, crisis management, IT housing, cyber resilience.',
    url: 'https://coin-bc.com/services',
  },
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
