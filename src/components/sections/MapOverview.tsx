'use client'

import { getLocalizedField } from '@/lib/locale'
import { MapOverviewSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const LocationsMap = dynamic(() => import('./LocationsMap'), { ssr: false })

interface MapOverviewProps {
  section: MapOverviewSection
  locale: Locale
}

export default function MapOverview({ section, locale }: MapOverviewProps) {
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="py-20">
      <div className="container-padding">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Interactive map with 3 COIN location pins */}
          <div className="lg:w-1/2 w-full">
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ height: '420px' }}>
              <LocationsMap />
            </div>
          </div>

          <div className="lg:w-1/2">
            {body && (
              <div
                className="text-secondary-700 leading-relaxed text-lg"
                style={{ whiteSpace: 'pre-line' }}
              >
                {body}
              </div>
            )}
            {section.isoBadgeUrl && (
              <div className="mt-8">
                <Image
                  src={section.isoBadgeUrl}
                  alt="ISO Certification"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
