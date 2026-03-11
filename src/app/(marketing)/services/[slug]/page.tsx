import { getServiceBySlug } from '@/lib/firestore/services'
import { getLocalizedField } from '@/lib/locale'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'
import Image from 'next/image'

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
      {/* Hero */}
      <section className="relative overflow-hidden text-white py-20">
        {service.heroImageUrl ? (
          <>
            <Image
              src={service.heroImageUrl}
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-900/80 via-secondary-800/70 to-primary-900/80" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-800 via-secondary-700 to-primary-900" />
        )}
        <div className="container-padding text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {getLocalizedField(service.title, 'en')}
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            {getLocalizedField(service.heroSubtitle, 'en')}
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16">
        <div className="container-padding">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-slate-600 leading-relaxed">
              {getLocalizedField(service.overview, 'en')}
            </p>
          </div>
        </div>
      </section>

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
