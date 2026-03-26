import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPublishedPartners } from '@/lib/firestore/partners'
import { getLocalizedField } from '@/lib/locale'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Partners',
  description: 'Discover our network of business and technology partners in the business continuity ecosystem.',
  alternates: { canonical: 'https://coin-bc.com/partners' },
  openGraph: {
    title: 'Our Partners | COIN AS',
    description: 'Discover our network of business and technology partners in the business continuity ecosystem.',
    url: 'https://coin-bc.com/partners',
  },
}

export default async function PartnersPage() {
  const partners = await getPublishedPartners()

  const businessPartners = partners.filter((p) => p.type === 'business')
  const technologyPartners = partners.filter((p) => p.type === 'technology')

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
        <div className="relative container-padding max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Our Partners</h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            We collaborate with leading organizations to deliver the best business continuity solutions.
          </p>
        </div>
      </section>

      {/* Business Partners */}
      {businessPartners.length > 0 && (
        <section className="py-16">
          <div className="container-padding max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Business Partners</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessPartners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Technology Partners */}
      {technologyPartners.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container-padding max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Technology Partners</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {technologyPartners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {partners.length === 0 && (
        <section className="py-20">
          <div className="container-padding max-w-6xl mx-auto text-center">
            <p className="text-slate-500 text-lg">Partner information coming soon.</p>
          </div>
        </section>
      )}

      {/* Become a Partner CTA */}
      <section className="py-16">
        <div className="container-padding max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Interested in partnering with COIN?</h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Join our ecosystem and collaborate with us to deliver best-in-class business continuity solutions.
          </p>
          <Link href="/partners/become-partner" className="btn-primary inline-block">
            Become a Partner
          </Link>
        </div>
      </section>
    </>
  )
}

function PartnerCard({ partner }: { partner: import('@/lib/types/partner').Partner }) {
  const description = getLocalizedField(partner.description)

  const content = (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="flex items-center justify-center h-20 mb-4">
        <Image
          src={partner.logoUrl}
          alt={partner.name}
          width={160}
          height={60}
          className="object-contain max-h-16"
        />
      </div>
      <h3 className="text-lg font-semibold text-center mb-2">{partner.name}</h3>
      {description && (
        <p className="text-slate-600 text-sm text-center flex-1">{description}</p>
      )}
      {partner.websiteUrl && (
        <p className="text-primary-600 text-sm text-center mt-4 font-medium">
          Visit website &rarr;
        </p>
      )}
    </div>
  )

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    )
  }

  return content
}
