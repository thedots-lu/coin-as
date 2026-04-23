import { Fragment } from 'react'
import { getPublishedServices } from '@/lib/firestore/services'
import { getLocalizedField } from '@/lib/locale'
import Link from 'next/link'
import { Metadata } from 'next'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import { ArrowRight, Building2, ChevronRight, GraduationCap, Server, Shield, AlertTriangle, Briefcase, LucideIcon } from 'lucide-react'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Services',
  description: 'COIN business continuity services: consultancy & training, recovery workplaces, crisis management, IT housing, cyberresilience.',
  alternates: { canonical: 'https://coin-bc.com/services' },
  openGraph: {
    title: 'Our Services | COIN AS',
    description: 'COIN business continuity services: consultancy & training, recovery workplaces, crisis management, IT housing, cyberresilience.',
    url: 'https://coin-bc.com/services',
  },
}

// Visual metadata keyed by service slug. Services without an entry fall back to DEFAULT_CARD_META.
type CardMeta = {
  icon: LucideIcon
  accentColor: string
  borderColor: string
  iconBg: string
  iconColor: string
}

const SERVICE_CARD_META: Record<string, CardMeta> = {
  'consultancy-and-training': {
    icon: GraduationCap,
    accentColor: 'bg-accent-500',
    borderColor: 'border-accent-500',
    iconBg: 'bg-accent-50',
    iconColor: 'text-accent-600',
  },
  'recovery-workplaces': {
    icon: Building2,
    accentColor: 'bg-primary-500',
    borderColor: 'border-primary-500',
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
  'crisis-management': {
    icon: AlertTriangle,
    accentColor: 'bg-accent-600',
    borderColor: 'border-accent-600',
    iconBg: 'bg-accent-50',
    iconColor: 'text-accent-700',
  },
  'it-housing': {
    icon: Server,
    accentColor: 'bg-primary-700',
    borderColor: 'border-primary-700',
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-700',
  },
  cyberresilience: {
    icon: Shield,
    accentColor: 'bg-coin-red-500',
    borderColor: 'border-coin-red-500',
    iconBg: 'bg-coin-red-50',
    iconColor: 'text-coin-red-600',
  },
}

const DEFAULT_CARD_META: CardMeta = {
  icon: Briefcase,
  accentColor: 'bg-primary-500',
  borderColor: 'border-primary-500',
  iconBg: 'bg-primary-50',
  iconColor: 'text-primary-600',
}

// ---------------------------------------------------------------------------
// Approach steps
// ---------------------------------------------------------------------------
const APPROACH_STEPS = [
  {
    title: 'Assess',
    description:
      'Understand your risks and define the right strategy. We analyse your business processes, critical assets and exposure to identify vulnerabilities and design a tailored continuity plan.',
  },
  {
    title: 'Prevent',
    description:
      'Reduce risks and strengthen your resilience. We implement security, monitoring and protection solutions to minimise the likelihood and impact of disruptions.',
  },
  {
    title: 'Respond',
    description:
      'Ensure continuity when disruption occurs. We provide recovery environments, crisis management support and secure access solutions to keep your operations running.',
  },
]

const CARD_ORDER = [
  'consultancy-and-training',
  'recovery-workplaces',
  'crisis-management',
  'it-housing',
  'cyberresilience',
]

export default async function ServicesPage() {
  const services = await getPublishedServices()

  // Build cards in the explicit order, dropping any service not listed.
  const cards = CARD_ORDER.flatMap((slug) => {
    const service = services.find((s) => (s.slug ?? s.id) === slug)
    if (!service) return []
    const meta = SERVICE_CARD_META[slug] ?? DEFAULT_CARD_META
    return [{ slug, service, ...meta }]
  })

  const quickLinks = [
    { label: 'Overview of Services', href: '#overview' },
    { label: 'Recovery Workplaces', href: '/services/recovery-workplaces' },
    { label: 'Consultancy and Training', href: '/services/consultancy-and-training' },
    { label: 'IT Housing', href: '/services/it-housing' },
    { label: 'Cyberresilience', href: '/services/cyberresilience' },
    { label: 'Crisis Management', href: '/services/crisis-management' },
  ]

  return (
    <>
      {/* ── 1. Minimal Banner ── */}
      <HubBanner title="Our Services" quickLinks={quickLinks} />

      {/* ── 2. Intro Bloc ── */}
      <section id="overview" className="bg-white py-16 md:py-20 scroll-mt-24">
        <div className="container-padding">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-accent-500 mb-4">
                Business Continuity &amp; Cyber Resilience
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-900 leading-tight mb-6">
                We enable organisations to strengthen their resilience across three key areas
              </h2>
              <p className="text-lg text-secondary-600 leading-relaxed">
                COIN has a unique blend of competences in Business Continuity, Digital Workplaces,
                Facility Management, High Resiliency Systems and Security. We help organisations
                with critical operations prepare for, respond to, and recover from any disruption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Approach Bloc ── */}
      <section id="approach" className="bg-primary-950 text-white py-16 md:py-20 scroll-mt-24">
        <div className="container-padding">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Our approach to business continuity
              </h2>
              <p className="text-lg text-primary-200 leading-relaxed">
                COIN supports your organisation across the full business continuity lifecycle:
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-4">
              {APPROACH_STEPS.map((step, index) => (
                <Fragment key={step.title}>
                  <div className="relative bg-primary-900/50 rounded-2xl p-8 border border-white/10 flex-1">
                    <h3 className="font-display text-xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-primary-200 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                  {index < APPROACH_STEPS.length - 1 && (
                    <div className="flex items-center justify-center py-2 md:py-0">
                      <ChevronRight
                        className="w-12 h-12 text-accent-500 rotate-90 md:rotate-0 shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Service Cards ── */}
      <section id="services" className="bg-warm-50 py-16 md:py-20 scroll-mt-24">
        <div className="container-padding">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-900 mb-12 text-center">
              Our services designed for resilience
            </h2>

            {cards.length === 0 ? (
              <p className="text-center text-secondary-600 text-lg">
                Services coming soon.
              </p>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {cards.map((card) => {
                const title = getLocalizedField(card.service.title, 'en')
                const tagline = getLocalizedField(card.service.heroSubtitle, 'en')

                // Extract bullets from the first features_list section
                const featuresSection = card.service.sections?.find(
                  (s) => s.type === 'features_list'
                ) as { features?: Array<{ title: { en: string; fr: string; nl: string } }> } | undefined

                let bullets = featuresSection?.features?.map((f) =>
                  getLocalizedField(f.title, 'en')
                ) ?? []

                // For it-housing: filter out "Separated secured rooms"
                if (card.slug === 'it-housing') {
                  bullets = bullets.filter((b) => b !== 'Separated secured rooms')
                }

                // Show only first 3 bullets
                const visibleBullets = bullets.slice(0, 3)

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
                        <h3 className="font-display text-2xl font-bold text-primary-900 leading-tight group-hover:text-primary-600 transition-colors">
                          {title}
                        </h3>
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-secondary-600 leading-relaxed mb-6 ml-16">
                      {tagline}
                    </p>

                    {/* Bullets (first 3, directly visible) */}
                    {visibleBullets.length > 0 && (
                      <ul className="space-y-2.5 mb-6 ml-16 flex-1">
                        {visibleBullets.map((bullet, i) => (
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
            )}
          </div>
        </div>
      </section>

      {/* ── 7. Bottom CTA ── */}
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
