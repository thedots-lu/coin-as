import { getServiceBySlug } from '@/lib/firestore/services'
import { getLocalizedField } from '@/lib/locale'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return { title: 'Service Not Found' }

  const title = getLocalizedField(service.seo?.metaTitle, 'en') || getLocalizedField(service.title, 'en')
  const description = getLocalizedField(service.seo?.metaDescription, 'en') || getLocalizedField(service.overview, 'en')

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(service.seo?.ogImage ? { images: [{ url: service.seo.ogImage }] } : {}),
    },
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  return (
    <>
      {/* Dynamic sections */}
      {service.sections && service.sections.length > 0 && (
        <PageSectionRenderer sections={service.sections} />
      )}

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
