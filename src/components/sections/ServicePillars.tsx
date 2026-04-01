'use client'

import { getLocalizedField } from '@/lib/locale'
import { ServicePillarsSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, Building2, ShieldCheck } from 'lucide-react'

// ---------------------------------------------------------------------------
// Service directory — 3 columns matching COIN's service categories
// ---------------------------------------------------------------------------
const SERVICE_COLUMNS = [
  {
    title: 'Consulting & Training',
    Icon: BookOpen,
    color: 'var(--color-primary-500)',
    colorRgb: '0, 71, 121',
    image: '/images/coin/coin-fotosharonwillems-51.webp',
    imageAlt: 'COIN AS team collaborating around a table, overhead view',
    services: [
      { name: 'Business Continuity', href: '/services/business-continuity' },
      { name: 'NIS2 & DORA Compliance', href: '/services/nis2-dora' },
      { name: 'Consultancy', href: '/services/consultancy' },
      { name: 'Training & Exercises', href: '/services/training' },
    ],
  },
  {
    title: 'Business Continuity Centres',
    Icon: Building2,
    color: 'var(--color-coin-red-500)',
    colorRgb: '165, 18, 24',
    image: '/images/coin/coin-luxembourg-contern-shared-room.webp',
    imageAlt: 'COIN AS reception and facilities at Contern',
    services: [
      { name: 'Crisis Management Facilities', href: '/services/crisis-management' },
      { name: 'Recovery Workplaces', href: '/services/recovery-workplaces' },
      { name: 'Satellite Offices', href: '/services/satellite-offices' },
      { name: 'Virtual Workplaces', href: '/services/virtual-workplaces' },
      { name: 'Co-location Services', href: '/services/co-location' },
    ],
  },
  {
    title: 'Cyberresilience Solutions',
    Icon: ShieldCheck,
    color: 'var(--color-accent-500)',
    colorRgb: '0, 153, 0',
    image: '/images/coin/co-location-area-munsbach.webp',
    imageAlt: 'COIN AS server room infrastructure in Münsbach',
    services: [
      { name: 'Secure COIN Key (BYOD)', href: '/services/cyber-resilience' },
      { name: 'Emergency Laptop Storage', href: '/services/cyber-resilience' },
      { name: 'Immutable Backup', href: '/services/cyber-resilience' },
      { name: 'Bulk Re-provisioning', href: '/services/cyber-resilience' },
    ],
  },
]

interface ServicePillarsProps {
  section: ServicePillarsSection
  locale: Locale
}

export default function ServicePillars({ section, locale }: ServicePillarsProps) {
  const heading = getLocalizedField(section.heading, locale)
  const subtitle = getLocalizedField(section.subtitle, locale)

  return (
    <section className="py-20 bg-white">
      <div className="container-padding">
        {/* Top: heading + intro with photo */}
        <AnimatedSection animation="slideUp" className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[2px] bg-primary-500 rounded-full" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-400">
                  Our Services
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-bold text-secondary-800 mb-4 leading-tight">
                {heading}
              </h2>
              {subtitle && (
                <p className="text-base text-secondary-500 leading-relaxed max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-48 h-48 lg:w-56 lg:h-56">
                <Image
                  src="/images/coin/handshield.png"
                  alt="COIN AS business partnership"
                  fill
                  className="object-contain"
                  sizes="224px"
                />
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* 3-column service directory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {SERVICE_COLUMNS.map((col, colIdx) => {
            const Icon = col.Icon
            return (
              <AnimatedSection
                key={col.title}
                animation="slideUp"
                delay={colIdx * 0.1}
              >
                <div className="group">
                  {/* Photo banner */}
                  <div className="relative h-44 rounded-xl overflow-hidden mb-5">
                    <Image
                      src={col.image}
                      alt={col.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {/* Color overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, rgba(${col.colorRgb}, 0.7) 0%, rgba(${col.colorRgb}, 0.2) 60%, transparent 100%)`,
                      }}
                    />
                    {/* Icon + title on photo */}
                    <div className="absolute bottom-0 inset-x-0 p-4 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm">
                        <Icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {col.title}
                      </h3>
                    </div>
                  </div>

                  {/* Service links */}
                  <ul className="space-y-1">
                    {col.services.map((service) => (
                      <li key={service.name}>
                        <Link
                          href={service.href}
                          className="group/link flex items-center gap-2 py-2.5 px-1 -mx-1 rounded-md text-secondary-600 hover:text-primary-600 hover:bg-primary-50/50 transition-colors duration-200"
                        >
                          <ArrowRight
                            className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200 flex-shrink-0"
                            style={{ color: col.color }}
                          />
                          <span className="text-[15px] leading-snug group-hover/link:translate-x-1 transition-transform duration-200">
                            {service.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <AnimatedSection animation="slideUp" delay={0.3} className="mt-14 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-600 hover:text-primary-800 transition-colors group"
          >
            View all services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}
