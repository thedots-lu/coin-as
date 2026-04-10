import { getServiceBySlug } from '@/lib/firestore/services'
import { getLocalizedField } from '@/lib/locale'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowRight, Building2, GraduationCap, Server, Shield, AlertTriangle } from 'lucide-react'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Services',
  description: 'COIN business continuity services: recovery workplaces, consultancy, IT housing, cyberresilience and crisis management.',
  alternates: { canonical: 'https://coin-bc.com/services' },
  openGraph: {
    title: 'Our Services | COIN AS',
    description: 'COIN business continuity services: recovery workplaces, consultancy, IT housing, cyberresilience and crisis management.',
    url: 'https://coin-bc.com/services',
  },
}

// ---------------------------------------------------------------------------
// The 5 top-level services (order, slug, icon, accent color)
// ---------------------------------------------------------------------------
const TOP_SERVICES = [
  {
    slug: 'recovery-workplaces',
    icon: Building2,
    accentColor: 'bg-primary-500',
    borderColor: 'border-primary-500',
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
  {
    slug: 'consultancy-and-training',
    icon: GraduationCap,
    accentColor: 'bg-accent-500',
    borderColor: 'border-accent-500',
    iconBg: 'bg-accent-50',
    iconColor: 'text-accent-600',
  },
  {
    slug: 'it-housing',
    icon: Server,
    accentColor: 'bg-primary-700',
    borderColor: 'border-primary-700',
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-700',
  },
  {
    slug: 'cyberresilience',
    icon: Shield,
    accentColor: 'bg-coin-red-500',
    borderColor: 'border-coin-red-500',
    iconBg: 'bg-coin-red-50',
    iconColor: 'text-coin-red-600',
  },
  {
    slug: 'crisis-management',
    icon: AlertTriangle,
    accentColor: 'bg-accent-600',
    borderColor: 'border-accent-600',
    iconBg: 'bg-accent-50',
    iconColor: 'text-accent-700',
  },
] as const

export default async function ServicesPage() {
  // Fetch the 5 top services in parallel
  const services = await Promise.all(
    TOP_SERVICES.map((s) => getServiceBySlug(s.slug))
  )

  // Combine service data with display metadata
  const cards = TOP_SERVICES.map((meta, i) => ({
    ...meta,
    service: services[i],
  })).filter((c) => c.service !== null)

  return (
    <>
      {/* ── 5 Service Cards ── */}
      <section className="bg-warm-50 py-16 md:py-20">
        <div className="container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {cards.map((card) => {
              if (!card.service) return null
              const title = getLocalizedField(card.service.title, 'en')
              const tagline = getLocalizedField(card.service.heroSubtitle, 'en')

              // Extract bullets from the first features_list section if available
              const featuresSection = card.service.sections?.find(
                (s) => s.type === 'features_list'
              ) as { features?: Array<{ title: { en: string; fr: string; nl: string } }> } | undefined
              const bullets = featuresSection?.features?.map((f) =>
                getLocalizedField(f.title, 'en')
              ) ?? []

              const Icon = card.icon

              return (
                <Link
                  key={card.slug}
                  href={`/services/${card.slug}`}
                  className="group relative bg-white rounded-2xl p-8 shadow-sm border border-secondary-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Top color bar */}
                  <div className={`absolute top-0 left-8 right-8 h-1 ${card.accentColor} rounded-b-full`} />

                  {/* Icon + Title */}
                  <div className="flex items-start gap-4 mb-4 pt-2">
                    <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${card.iconColor}`} strokeWidth={2} />
                    </div>
                    <div className="flex-1 pt-1">
                      <h2 className="font-display text-2xl font-bold text-primary-900 leading-tight group-hover:text-primary-600 transition-colors">
                        {title}
                      </h2>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-secondary-600 leading-relaxed mb-6 ml-16">
                    {tagline}
                  </p>

                  {/* Bullets */}
                  {bullets.length > 0 && (
                    <ul className="space-y-2.5 mb-6 ml-16 flex-1">
                      {bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-secondary-700 leading-snug">
                          <span className={`shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${card.accentColor}`} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Learn more arrow */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:text-primary-800 transition-colors ml-16 mt-auto">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-primary-950 text-white py-20">
        <div className="container-padding text-center">
          <div className="w-12 h-1 bg-accent-500 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Not sure where to start?
          </h2>
          <p className="text-primary-200 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Our team will assess your current resilience posture and recommend
            the right combination of services for your organisation.
          </p>
          <Link
            href="/contact"
            className="btn-primary inline-flex items-center gap-2 text-base"
          >
            <span>Get in touch</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      </section>
    </>
  )
}
