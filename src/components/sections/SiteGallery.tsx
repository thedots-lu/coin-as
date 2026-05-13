'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { SiteGallerySection } from '@/lib/types/page'
import { Site } from '@/lib/types/site'
import { Locale } from '@/lib/types/locale'
import { siteSlug } from '@/lib/firestore/sites'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { useEditing } from '@/components/admin/cms/EditingContext'
import { isHtml, sanitizeRichHtml } from '@/lib/utils/html'

interface SiteGalleryProps {
  section: SiteGallerySection
  locale: Locale
  /**
   * Sites sourced from the `sites` collection — single source of truth shared
   * with the MapOverview compact cards on the About page. Falls back to the
   * legacy `section.sites` array when not provided (transitional support).
   */
  sites?: Site[]
}

export default function SiteGallery({ section, locale, sites }: SiteGalleryProps) {
  const isEditing = !!useEditing()
  // Prefer the shared collection. Fall back to the legacy embedded sites
  // array so a fresh-install or pre-migration page keeps rendering.
  const items = sites && sites.length > 0
    ? sites.map((s) => ({
        name: s.name,
        country: s.country,
        // Prefer the interior / office shot for the gallery; fall back to
        // the exterior building image so cards always render an image.
        imageUrl: s.officeImageUrl || s.imageUrl,
        description: s.description,
        address: s.address,
        phone: s.phone,
        capacity: s.capacity,
        mapUrl: s.mapUrl,
        slug: siteSlug(s),
      }))
    : section.sites.map((s) => ({ ...s, slug: undefined as string | undefined }))

  return (
    <section className="py-20 bg-secondary-50">
      <div className="container-padding">
        {isEditing && (
          <div className="max-w-3xl mx-auto mb-8 bg-amber-50 border border-amber-200 rounded-md px-4 py-2.5 text-[12px] text-amber-900 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>
              The site cards below are managed in{' '}
              <a
                href="/admin/sites"
                className="font-semibold underline hover:no-underline"
              >
                Sites
              </a>
              .
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((site, index) => {
            const name = getLocalizedField(site.name, locale)
            const country = getLocalizedField(site.country, locale)
            const description = getLocalizedField(site.description, locale)
            const capacity = site.capacity ? getLocalizedField(site.capacity, locale) : null

            return (
              <AnimatedSection key={index} animation="zoomIn" delay={index * 0.1}>
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
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

                  <div className="p-6 flex flex-col gap-4 flex-1">
                    {description &&
                      (isHtml(description) ? (
                        <div
                          className="text-secondary-600 text-sm leading-relaxed prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1"
                          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(description) }}
                        />
                      ) : (
                        <p className="text-secondary-600 text-sm leading-relaxed">{description}</p>
                      ))}

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

                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      {site.slug && (
                        <Link
                          href={`/locations/${site.slug}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          Discover
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                      {site.mapUrl && (
                        <a
                          href={site.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          View on map
                        </a>
                      )}
                    </div>
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
