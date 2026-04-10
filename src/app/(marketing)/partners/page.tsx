import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { getPublishedPartners } from '@/lib/firestore/partners'
import { getLocalizedField } from '@/lib/locale'
import HubBanner from '@/components/knowledge-hub/HubBanner'

function getYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/)
  return match?.[1] ?? null
}

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
  const partnersWithVideos = partners.filter((p) => p.videoUrl && getYoutubeId(p.videoUrl))

  const quickLinks: Array<{ label: string; href: string }> = []
  if (technologyPartners.length > 0) quickLinks.push({ label: 'Technology Partners', href: '#technology' })
  if (businessPartners.length > 0) quickLinks.push({ label: 'Business Partners', href: '#business' })
  if (partnersWithVideos.length > 0) quickLinks.push({ label: 'Partner Stories', href: '#stories' })
  quickLinks.push({ label: 'Become a Partner', href: '/partners/become-partner' })

  return (
    <>
      <HubBanner title="Our Partners" quickLinks={quickLinks} />

      {/* Business Partners */}
      {businessPartners.length > 0 && (
        <section id="business" className="py-16 scroll-mt-24">
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
        <section id="technology" className="py-16 bg-warm-50 scroll-mt-24">
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

      {/* Partner videos */}
      {partnersWithVideos.length > 0 && (
        <section id="stories" className="py-16 bg-primary-950 text-white scroll-mt-24">
          <div className="container-padding max-w-6xl mx-auto">
            <div className="mb-10 text-center">
              <div className="w-12 h-1 bg-accent-500 rounded-full mx-auto mb-5" />
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-3">
                Partner stories
              </h2>
              <p className="text-primary-200 max-w-2xl mx-auto">
                Discover how COIN works with its technology partners through real client case videos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {partnersWithVideos.map((partner) => {
                const videoId = getYoutubeId(partner.videoUrl)
                if (!videoId) return null
                const caption = partner.videoCaption
                  ? getLocalizedField(partner.videoCaption)
                  : ''

                return (
                  <div key={partner.id} className="bg-primary-900/50 rounded-2xl overflow-hidden border border-white/10">
                    <div className="relative aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                        title={`${partner.name} video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="w-4 h-4 text-accent-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent-400">
                          {partner.name}
                        </span>
                      </div>
                      {caption && (
                        <p className="text-white/80 text-sm leading-relaxed">{caption}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Become a Partner CTA */}
      <section className="py-16">
        <div className="container-padding max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Interested in partnering with COIN?</h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Collaborate with us to deliver effective business continuity solutions across the BeNeLux.
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
        {partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            width={160}
            height={60}
            className="object-contain max-h-16"
          />
        ) : (
          <div className="w-40 h-16 rounded bg-secondary-100 flex items-center justify-center text-secondary-400 text-sm font-medium">
            {partner.name}
          </div>
        )}
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
