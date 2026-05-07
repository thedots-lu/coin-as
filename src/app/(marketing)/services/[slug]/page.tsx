import { getServiceBySlug, getPublishedServices } from '@/lib/firestore/services'
import { getLocalizedField } from '@/lib/locale'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'
import ServiceBreadcrumb from '@/components/layout/ServiceBreadcrumb'
import RelatedServicesCarousel from '@/components/sections/RelatedServicesCarousel'

const RELATED_ORDER = [
  'consultancy-and-training',
  'recovery-workplaces',
  'crisis-management',
  'it-housing',
  'cyberresilience',
]

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return { title: 'Service Not Found' }
  return generatePageMetadata(service.seo, service.title, {
    path: `/services/${slug}`,
  })
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [service, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getPublishedServices(),
  ])
  if (!service) notFound()

  const relatedServices = RELATED_ORDER.flatMap((s) => {
    if (s === slug) return []
    const match = allServices.find((svc) => (svc.slug ?? svc.id) === s)
    return match ? [match] : []
  })

  return (
    <>
      <ServiceBreadcrumb serviceTitle={getLocalizedField(service.title, 'en')} />
      {/* Dynamic sections */}
      {service.sections && service.sections.length > 0 && (
        <PageSectionRenderer sections={service.sections} />
      )}

      {/* The per-service "Read our article" CTA is rendered on the
          /services overview cards (see ServicesGrid), not here. */}

      {/* Photo gallery placeholder - to be populated when Sam sends photos */}
      {/*
      <section className="py-12 bg-warm-50">
        <div className="container-padding max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-primary-900 mb-6">Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            -- photos go here --
          </div>
        </div>
      </section>
      */}

      {/* Related services carousel (excludes the current one) */}
      <RelatedServicesCarousel services={relatedServices} />

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-padding text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Interested in this service?</h2>
          <a
            href="/contact"
            className="inline-block bg-white text-primary-600 hover:bg-slate-100 px-8 py-4 rounded-lg text-lg font-medium shadow-lg transition-all duration-300"
          >
            Contact us
          </a>
        </div>
      </section>
    </>
  )
}
