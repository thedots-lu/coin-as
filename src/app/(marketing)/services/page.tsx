import { getPublishedServices } from '@/lib/firestore/services'
import { getLocalizedField } from '@/lib/locale'
import Link from 'next/link'
import { Metadata } from 'next'
import Image from 'next/image'
import { ArrowRight, Shield, Building2, MonitorSmartphone } from 'lucide-react'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Services',
  description: 'COIN business continuity services: consulting, training, recovery workplaces, and cyberresilience solutions.',
  alternates: { canonical: 'https://coin-bc.com/services' },
  openGraph: {
    title: 'Our Services | COIN AS',
    description: 'COIN business continuity services: consulting, training, recovery workplaces, and cyberresilience solutions.',
    url: 'https://coin-bc.com/services',
  },
}

const categoryMeta = {
  consulting: {
    overline: 'Advisory & Education',
    heading: 'Consulting & Training',
    description: 'Strategic guidance and hands-on training to build resilience into your organisation from the ground up.',
    icon: Shield,
    accentColor: 'bg-accent-500',
    tagColor: 'text-accent-700 bg-accent-50 border-accent-200',
  },
  centers: {
    overline: 'Recovery Infrastructure',
    heading: 'Business Continuity Centres',
    description: 'Fully equipped fallback workplaces across the BeNeLux, ready when you need them most.',
    icon: Building2,
    accentColor: 'bg-primary-500',
    tagColor: 'text-primary-700 bg-primary-50 border-primary-200',
  },
  cyber: {
    overline: 'Digital Defence',
    heading: 'Cyberresilience Solutions',
    description: 'Proactive cyber defence and rapid recovery capabilities to keep your digital operations secure.',
    icon: MonitorSmartphone,
    accentColor: 'bg-coin-red-500',
    tagColor: 'text-coin-red-700 bg-coin-red-50 border-coin-red-200',
  },
} as const

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const truncated = text.slice(0, max)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

export default async function ServicesPage() {
  const services = await getPublishedServices()

  const categories = [
    { key: 'consulting' as const, items: services.filter((s) => s.category === 'consulting' && s.slug !== 'overview') },
    { key: 'centers' as const, items: services.filter((s) => s.category === 'centers' && s.slug !== 'overview') },
    { key: 'cyber' as const, items: services.filter((s) => s.category === 'cyber' && s.slug !== 'overview') },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/coin/coin-fotosharonwillems-51.webp"
            alt="COIN AS professionals in a business continuity planning session"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-primary-950/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-950/60 to-transparent" />
        </div>

        <div className="container-padding relative z-10 py-24 md:py-32">
          {/* Accent bar */}
          <div className="w-16 h-1 bg-accent-500 mb-8" />

          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-300 mb-4">
            Our Services
          </p>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] mb-6 max-w-3xl">
            Protecting What
            <br />
            Matters Most
          </h1>

          <p className="text-lg md:text-xl text-primary-200 max-w-2xl leading-relaxed">
            Three decades of expertise in business continuity consulting,
            recovery infrastructure, and cyberresilience across the BeNeLux.
          </p>

          {/* Stats row */}
          <div className="mt-12 flex flex-wrap gap-x-12 gap-y-4 border-t border-white/10 pt-8">
            <div>
              <span className="block text-3xl font-bold text-white">30+</span>
              <span className="text-sm text-primary-300 uppercase tracking-wider">Years Experience</span>
            </div>
            <div>
              <span className="block text-3xl font-bold text-white">11</span>
              <span className="text-sm text-primary-300 uppercase tracking-wider">Specialised Services</span>
            </div>
            <div>
              <span className="block text-3xl font-bold text-white">3</span>
              <span className="text-sm text-primary-300 uppercase tracking-wider">Countries Covered</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Sections ── */}
      {categories.map((cat, index) => {
        const meta = categoryMeta[cat.key]
        const isDark = index % 2 !== 0
        const IconComponent = meta.icon

        return (
          <section
            key={cat.key}
            className={
              isDark
                ? 'bg-primary-950 text-white py-20 md:py-28'
                : 'bg-warm-50 text-slate-900 py-20 md:py-28'
            }
          >
            <div className="container-padding">
              {/* Section header */}
              <div className="max-w-3xl mb-14">
                {/* Accent bar + overline */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-1 ${meta.accentColor} rounded-full`} />
                  <span
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      isDark ? 'text-primary-300' : 'text-primary-500'
                    }`}
                  >
                    {meta.overline}
                  </span>
                </div>

                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {meta.heading}
                </h2>

                <p
                  className={`text-lg leading-relaxed ${
                    isDark ? 'text-primary-200' : 'text-slate-600'
                  }`}
                >
                  {meta.description}
                </p>
              </div>

              {/* Service cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.items.map((service) => {
                  const title = getLocalizedField(service.title, 'en')
                  const overview = getLocalizedField(service.overview, 'en')

                  return (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      className="group relative block"
                    >
                      <div
                        className={`relative h-full rounded-xl p-7 transition-all duration-300 group-hover:-translate-y-1 ${
                          isDark
                            ? 'bg-primary-900/60 border border-white/8 group-hover:border-white/16 group-hover:bg-primary-900/80 shadow-lg shadow-black/20 group-hover:shadow-xl group-hover:shadow-black/30'
                            : 'bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm group-hover:shadow-lg'
                        }`}
                      >
                        {/* Top accent line */}
                        <div
                          className={`absolute top-0 left-7 right-7 h-px ${
                            isDark ? 'bg-white/6' : 'bg-slate-100'
                          } group-hover:${meta.accentColor} transition-colors duration-300`}
                        />

                        {/* Category tag */}
                        <div className="mb-4">
                          <span
                            className={`inline-block text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded border ${
                              isDark
                                ? 'text-primary-300 bg-white/5 border-white/10'
                                : meta.tagColor
                            }`}
                          >
                            {meta.overline}
                          </span>
                        </div>

                        {/* Icon + Title */}
                        <div className="flex items-start gap-3 mb-3">
                          <IconComponent
                            className={`w-5 h-5 mt-0.5 shrink-0 transition-colors duration-300 ${
                              isDark
                                ? 'text-primary-400 group-hover:text-accent-400'
                                : 'text-primary-500 group-hover:text-accent-500'
                            }`}
                            strokeWidth={1.8}
                          />
                          <h3
                            className={`font-display text-lg font-semibold leading-snug transition-colors duration-300 ${
                              isDark
                                ? 'text-white group-hover:text-accent-300'
                                : 'text-slate-900 group-hover:text-primary-600'
                            }`}
                          >
                            {title}
                          </h3>
                        </div>

                        {/* Overview text */}
                        <p
                          className={`text-sm leading-relaxed mb-6 ${
                            isDark ? 'text-primary-300' : 'text-slate-500'
                          }`}
                        >
                          {truncate(overview, 120)}
                        </p>

                        {/* Learn more */}
                        <div
                          className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-300 ${
                            isDark
                              ? 'text-primary-400 group-hover:text-accent-400'
                              : 'text-primary-500 group-hover:text-accent-600'
                          }`}
                        >
                          <span>Learn more</span>
                          <ArrowRight
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                            strokeWidth={2}
                          />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}

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
