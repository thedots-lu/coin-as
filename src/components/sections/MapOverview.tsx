'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Lock, Phone } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { MapOverviewSection } from '@/lib/types/page'
import { Site } from '@/lib/types/site'
import { Locale, LocaleString } from '@/lib/types/locale'
import EditableText from '@/components/admin/cms/EditableText'
import EditableImage from '@/components/admin/cms/EditableImage'
import RichInlineText from '@/components/admin/cms/RichInlineText'
import { useEditing } from '@/components/admin/cms/EditingContext'

const DEFAULT_MAP_IMAGE = '/images/coin/Amsterdam.png'
const DEFAULT_ISO_BADGE = '/images/coin/kiwa-iso-27001-logo.jpg'
const DEFAULT_HEADING = 'Our Locations'
const DEFAULT_CTA_LABEL = 'View all our locations'
const DEFAULT_COLOR = 'var(--color-primary-500)'
const EMPTY_LS: LocaleString = { en: '', fr: '', nl: '' }

interface MapOverviewProps {
  section: MapOverviewSection
  locale: Locale
  basePath: string
  /**
   * Sites sourced from the `sites` collection — single source of truth shared
   * with the SiteGallery on the dedicated Locations page.
   */
  sites?: Site[]
}

// Fallback used until the `sites` collection has been seeded. Once data is
// migrated, the prop wins and this list is never reached.
const FALLBACK_SITES: Site[] = [
  {
    id: '_fallback-amsterdam',
    name: { en: 'Amsterdam', fr: 'Amsterdam', nl: 'Amsterdam' },
    country: { en: 'Netherlands', fr: 'Pays-Bas', nl: 'Nederland' },
    phone: '+31 88 26 46 000',
    capacity: { en: '250 Recovery workplaces · Crisis rooms', fr: '', nl: '' },
    description: { en: '', fr: '', nl: '' },
    color: '#004779',
    imageUrl: '/images/coin/amsterdam-office.webp',
    order: 0,
  },
  {
    id: '_fallback-antwerp',
    name: { en: 'Antwerp', fr: 'Anvers', nl: 'Antwerpen' },
    country: { en: 'Belgium', fr: 'Belgique', nl: 'België' },
    phone: '',
    capacity: { en: 'Customer dedicated recovery site', fr: '', nl: '' },
    description: { en: '', fr: '', nl: '' },
    color: '#009900',
    imageUrl: '/images/coin/coin_office_antwerp.jpg',
    order: 1,
  },
  {
    id: '_fallback-munsbach',
    name: { en: 'Munsbach', fr: 'Munsbach', nl: 'Munsbach' },
    country: { en: 'Luxembourg', fr: 'Luxembourg', nl: 'Luxemburg' },
    phone: '+352 357 05 30',
    capacity: { en: '500 recovery workplaces · IT Housing', fr: '', nl: '' },
    description: { en: '', fr: '', nl: '' },
    color: '#A51218',
    imageUrl: '/images/coin/COIN_Luxembourg_Munsbach_Office_Ext.webp',
    order: 2,
  },
  {
    id: '_fallback-contern',
    name: { en: 'Contern', fr: 'Contern', nl: 'Contern' },
    country: { en: 'Luxembourg', fr: 'Luxembourg', nl: 'Luxemburg' },
    phone: '+352 357 05 30',
    capacity: { en: '250 recovery workplaces · Crisis Room', fr: '', nl: '' },
    description: { en: '', fr: '', nl: '' },
    color: '#A51218',
    imageUrl: '/images/coin/contern-ltc-building.webp',
    order: 3,
  },
]

export default function MapOverview({ section, locale, basePath, sites }: MapOverviewProps) {
  const isEditing = !!useEditing()
  const headingValue: LocaleString = section.heading ?? { en: '', fr: '', nl: '' }
  const headingDisplayed = getLocalizedField(headingValue, locale) || DEFAULT_HEADING
  const mapSrc = section.mapImageUrl || DEFAULT_MAP_IMAGE
  const isoSrc = section.isoBadgeUrl || DEFAULT_ISO_BADGE
  const displayedSites = sites && sites.length > 0 ? sites : FALLBACK_SITES
  const ctaLabelValue = section.ctaLabel ?? EMPTY_LS
  const ctaLabelDisplayed = getLocalizedField(ctaLabelValue, locale) || DEFAULT_CTA_LABEL

  return (
    <section id="locations" className="py-16 md:py-20 bg-warm-50 scroll-mt-24">
      <div className="container-padding max-w-6xl mx-auto">
        {/* Section title */}
        <div className="mb-10">
          <div className="w-12 h-1 bg-accent-500 rounded-full mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-black font-display tracking-tight mb-4">
            {isEditing ? (
              <EditableText
                path={`${basePath}.heading`}
                value={headingValue}
                placeholder={DEFAULT_HEADING}
                as="span"
                multiline
              />
            ) : (
              headingDisplayed
            )}
          </h2>
          <RichInlineText
            path={`${basePath}.body`}
            value={section.body}
            className="text-secondary-600 text-base md:text-lg leading-relaxed prose !max-w-3xl [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2"
          />
        </div>

        {/* Map + sites grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Map image + certification */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start gap-6">
            <div className="relative w-full max-w-sm">
              <EditableImage
                path={`${basePath}.mapImageUrl`}
                src={mapSrc}
                alt="COIN BeNeLux locations: Amsterdam, Antwerp, Luxembourg"
                width={400}
                height={500}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* ISO certification badge */}
            <div className="w-full max-w-sm flex flex-col sm:flex-row items-center gap-5 sm:gap-6 bg-white rounded-2xl border border-secondary-100 shadow-sm px-6 py-5">
              <div className="relative shrink-0">
                <EditableImage
                  path={`${basePath}.isoBadgeUrl`}
                  src={isoSrc}
                  alt="Kiwa ISO/IEC 27001 certification"
                  width={90}
                  height={167}
                  className="h-24 md:h-28 w-auto"
                />
              </div>
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

            {/* Link to dedicated Locations page */}
            <Link
              href="/locations"
              className="w-full max-w-sm inline-flex items-center justify-between gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold shadow-sm hover:bg-primary-700 transition-colors"
            >
              {isEditing ? (
                <EditableText
                  path={`${basePath}.ctaLabel`}
                  value={ctaLabelValue}
                  placeholder={DEFAULT_CTA_LABEL}
                  as="span"
                />
              ) : (
                <span>{ctaLabelDisplayed}</span>
              )}
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>

          {/* Sites list */}
          <div className="lg:col-span-3">
            {isEditing && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md px-4 py-2.5 text-[12px] text-amber-900 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  The site cards are managed in{' '}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayedSites.map((site) => {
              const name = getLocalizedField(site.name, locale)
              const country = getLocalizedField(site.country, locale)
              const capacity = site.capacity ? getLocalizedField(site.capacity, locale) : ''
              return (
                <div
                  key={site.id}
                  className="bg-white rounded-2xl border border-secondary-100 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {site.imageUrl && (
                    <div className="relative w-full aspect-[4/3] bg-secondary-50">
                      <Image
                        src={site.imageUrl}
                        alt={`COIN ${name} site`}
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
                        style={{ backgroundColor: site.color || DEFAULT_COLOR }}
                      />
                      <div>
                        <h3 className="font-bold text-primary-900 font-display text-lg leading-tight">
                          {name}
                        </h3>
                        <p className="text-xs text-secondary-400 uppercase tracking-wider font-medium">
                          {country}
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
                      {capacity && (
                        <p className="text-xs text-secondary-500 italic pt-1">{capacity}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
