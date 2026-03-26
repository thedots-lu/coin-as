'use client'

import { getLocalizedField } from '@/lib/locale'
import { MapOverviewSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import BeNeLuxMap from './BeNeLuxMap'

interface MapOverviewProps {
  section: MapOverviewSection
  locale: Locale
}

export default function MapOverview({ section, locale }: MapOverviewProps) {
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="py-20">
      <div className="container-padding">
        {/* Intro text */}
        {body && (
          <div className="max-w-3xl mb-12 text-secondary-700 leading-relaxed text-lg" style={{ whiteSpace: 'pre-line' }}>
            {body}
          </div>
        )}

        {/* Stylised BeNeLux map + site list */}
        <BeNeLuxMap />
      </div>
    </section>
  )
}
