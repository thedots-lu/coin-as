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
    city: 'Amsterdam',
    country: 'Netherlands',
    phone: '+31 88 26 46 000',
    detail: '500 Recovery workplaces · Crisis rooms',
    color: '#004779',
    image: '/images/coin/amsterdam-office.webp',
  },
  {
    city: 'Antwerp',
    country: 'Belgium',
    phone: '',
    detail: 'Customer dedicated recovery site',
    color: '#009900',
    image: null,
  },
  {
    city: 'Munsbach',
    country: 'Luxembourg',
    phone: '+352 357 05 30',
    detail: '500 recovery workplaces · IT Housing',
    color: '#A51218',
    image: null,
  },
  {
    city: 'Contern',
    country: 'Luxembourg',
    phone: '+352 357 05 30',
    detail: '250 recovery workplaces · Crisis Room',
    color: '#A51218',
    image: '/images/coin/contern-ltc-building.webp',
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
          <h2 className="text-3xl md:text-4xl font-bold text-black font-display tracking-tight mb-4">
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
          {/* Map image + certification */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start gap-6">
            <div className="relative w-full max-w-sm">
              <Image
                src="/images/coin/Amsterdam.png"
                alt="COIN BeNeLux locations: Amsterdam, Antwerp, Luxembourg"
                width={400}
                height={500}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* ISO certification badge */}
            <div className="w-full max-w-sm flex flex-col sm:flex-row items-center gap-5 sm:gap-6 bg-white rounded-2xl border border-secondary-100 shadow-sm px-6 py-5">
              <Image
                src="/images/coin/kiwa-iso-27001-logo.jpg"
                alt="Kiwa ISO/IEC 27001 certification"
                width={90}
                height={167}
                className="h-24 md:h-28 w-auto shrink-0"
              />
              <div className="text-center sm:text-left">
                <p className="text-xs uppercase tracking-wider text-secondary-400 font-medium mb-1">
                  Certified
                </p>
                <p className="text-base md:text-lg font-semibold text-secondary-800 leading-snug">
                  All sites ISO 27001/2022 certified
                </p>
                <p className="text-sm text-secondary-500 mt-1">24/7 operations</p>
              </div>
            </div>
          </div>

          {/* Sites list */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SITES.map((site) => (
              <div
                key={`${site.city}-${site.country}`}
                className="bg-white rounded-2xl border border-secondary-100 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
              >
                {site.image && (
                  <div className="relative w-full aspect-[4/3] bg-secondary-50">
                    <Image
                      src={site.image}
                      alt={`COIN ${site.city} site`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
