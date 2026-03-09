import { getLocalizedField } from '@/lib/locale'
import { MapOverviewSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Image from 'next/image'

interface MapOverviewProps {
  section: MapOverviewSection
  locale: Locale
}

export default function MapOverview({ section, locale }: MapOverviewProps) {
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="py-20 bg-white">
      <div className="container-padding">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {section.mapImageUrl && (
            <div className="lg:w-1/2">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg group">
                <Image
                  src={section.mapImageUrl}
                  alt="Locations map"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/20 to-transparent" />
              </div>
            </div>
          )}
          <div className={section.mapImageUrl ? 'lg:w-1/2' : 'max-w-3xl mx-auto'}>
            {body && (
              <div
                className="text-gray-700 leading-relaxed text-lg"
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
