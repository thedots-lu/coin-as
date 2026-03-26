'use client'

import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { SiteGallerySection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface SiteGalleryProps {
  section: SiteGallerySection
  locale: Locale
}

export default function SiteGallery({ section, locale }: SiteGalleryProps) {
  return (
    <section className="py-20 bg-secondary-50">
      <div className="container-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.sites.map((site, index) => {
            const name = getLocalizedField(site.name, locale)
            const country = getLocalizedField(site.country, locale)
            const description = getLocalizedField(site.description, locale)
            const capacity = site.capacity ? getLocalizedField(site.capacity, locale) : null

            return (
              <AnimatedSection
                key={index}
                animation="zoomIn"
                delay={index * 0.1}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden group">
                    <Image
                      src={site.imageUrl}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-semibold text-white">{name}</h3>
                      {country && (
                        <p className="text-primary-200 text-sm mt-0.5">{country}</p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex flex-col gap-4 flex-1">
                    {description && (
                      <p className="text-secondary-600 text-sm leading-relaxed">{description}</p>
                    )}

                    <div className="mt-auto space-y-2 pt-4 border-t border-secondary-100">
                      {site.address && (
                        <div className="flex items-start gap-2 text-sm text-secondary-700">
                          <svg className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{site.address}</span>
                        </div>
                      )}
                      {site.phone && (
                        <div className="flex items-center gap-2 text-sm text-secondary-700">
                          <svg className="w-4 h-4 shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-primary-600 transition-colors">
                            {site.phone}
                          </a>
                        </div>
                      )}
                      {capacity && (
                        <div className="flex items-start gap-2 text-sm text-secondary-700">
                          <svg className="w-4 h-4 mt-0.5 shrink-0 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{capacity}</span>
                        </div>
                      )}
                    </div>

                    {site.mapUrl && (
                      <a
                        href={site.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors mt-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        View on map
                      </a>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
