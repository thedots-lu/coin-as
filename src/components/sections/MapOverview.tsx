'use client'

import Image from 'next/image'
import { Phone } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { MapOverviewSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'

interface MapOverviewProps {
  section: MapOverviewSection
  locale: Locale
}

const SITES = [
  {
    city: 'Schiphol-Rijk',
    country: 'Netherlands',
    phone: '+31 88 26 46 000',
    detail: 'Recovery workplaces · Crisis rooms · Co-location',
    color: '#004779',
  },
  {
    city: 'Antwerp',
    country: 'Belgium',
    phone: '',
    detail: 'Dedicated site',
    color: '#009900',
  },
  {
    city: 'Munsbach',
    country: 'Luxembourg',
    phone: '+352 357 05 30',
    detail: '500 workplaces · TIER-3 · ISO 27001',
    color: '#A51218',
  },
  {
    city: 'Contern',
    country: 'Luxembourg',
    phone: '+352 357 05 30',
    detail: '250 workplaces · 10 min from Munsbach',
    color: '#A51218',
  },
]

export default function MapOverview({ section, locale }: MapOverviewProps) {
  const body = getLocalizedField(section.body, locale)

  return (
    <section id="locations" className="py-16 md:py-20 bg-warm-50 scroll-mt-24">
      <div className="container-padding max-w-6xl mx-auto">
        {/* Section title */}
        <div className="mb-10">
          <div className="w-12 h-1 bg-accent-500 rounded-full mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 font-display tracking-tight mb-4">
            Our Locations
          </h2>
          {body && (
            <p className="text-secondary-600 text-base md:text-lg leading-relaxed max-w-3xl">
              {body}
            </p>
          )}
        </div>

        {/* Map + sites grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Map image */}
          <div className="lg:col-span-2 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-sm">
              <Image
                src="/images/coin/carte-coin.png"
                alt="COIN BeNeLux locations: Amsterdam, Antwerp, Luxembourg"
                width={400}
                height={500}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Sites list */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SITES.map((site) => (
              <div
                key={`${site.city}-${site.country}`}
                className="bg-white rounded-2xl p-5 border border-secondary-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: site.color }}
                  />
                  <div>
                    <h3 className="font-bold text-primary-900 font-display text-lg leading-tight">
                      {site.city}
                    </h3>
                    <p className="text-xs text-secondary-400 uppercase tracking-wider font-medium">
                      {site.country}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {site.phone && (
                    <a
                      href={`tel:${site.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-sm text-secondary-700 font-semibold hover:text-primary-600 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0 text-secondary-400" />
                      <span>{site.phone}</span>
                    </a>
                  )}
                  <p className="text-xs text-secondary-500 italic pt-1">{site.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ISO certification badge */}
        <div className="mt-12 flex items-center justify-center gap-3 text-base md:text-lg text-secondary-700">
          <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-5 h-5 fill-white">
              <path d="M9 12l-2-2 1.4-1.4L9 9.2l3.6-3.6L14 7z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-semibold">All sites ISO 27001 certified · 24/7 operations</span>
        </div>
      </div>
    </section>
  )
}
