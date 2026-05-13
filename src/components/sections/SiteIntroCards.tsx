'use client'

import { MapPin } from 'lucide-react'
import { Site } from '@/lib/types/site'
import { Locale, LocaleString } from '@/lib/types/locale'
import { getLocalizedField } from '@/lib/locale'
import { siteDetailDescription } from '@/lib/firestore/sites'
import { sanitizeRichHtml } from '@/lib/utils/html'
import RichInlineText from '@/components/admin/cms/RichInlineText'
import { useEditing } from '@/components/admin/cms/EditingContext'
import SiteGalleryCarousel from './SiteGalleryCarousel'

interface Props {
  site: Site
  locale: Locale
}

/**
 * Top block of a per-site detail page: a 1/3 description card on the left
 * and a 2/3 image carousel card on the right (stacked on mobile/tablet).
 * Body text is `Site.detailDescription` (falling back per-locale to
 * `Site.description`); gallery slides live on `Site.gallerySlides` — both are
 * inline-editable in the visual editor.
 */
export default function SiteIntroCards({ site, locale }: Props) {
  const isEditing = !!useEditing()
  // Per-locale fallback: each locale uses detailDescription[locale] when
  // filled, otherwise the matching description[locale]. Used both for the
  // public render and as the editor's initial content (WYSIWYG), so leaving
  // detailDescription blank in a locale means "show the overview text".
  const displayValue: LocaleString = siteDetailDescription(site)
  const descriptionText = getLocalizedField(displayValue, locale)
  const siteName = getLocalizedField(site.name, locale)
  const siteCountry = getLocalizedField(site.country, locale)

  return (
    <section className="py-12 md:py-16 bg-warm-50">
      <div className="container-padding max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Description card — 1/3.
              Name + country are intentionally NOT inline-editable here: they
              are the source of truth on the Site doc itself and are edited
              from the form admin at /admin/sites. */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 md:p-8 flex flex-col">
            <div
              className="w-12 h-1 rounded-full mb-4"
              style={{ backgroundColor: site.color || 'var(--color-accent-500)' }}
            />
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary-600" strokeWidth={2} />
              </div>
              <div className="pt-0.5 min-w-0">
                <h2 className="font-display text-2xl font-bold text-primary-900 leading-tight">
                  {siteName}
                </h2>
                {siteCountry && (
                  <p className="text-xs text-secondary-400 uppercase tracking-wider font-medium mt-0.5">
                    {siteCountry}
                  </p>
                )}
              </div>
            </div>
            {(descriptionText || isEditing) ? (
              <RichInlineText
                path="detailDescription"
                value={displayValue}
                className="text-secondary-700 leading-relaxed prose prose-sm max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5"
              />
            ) : (
              <div
                className="text-secondary-400 text-sm italic"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml('') }}
              />
            )}
          </div>

          {/* Image carousel card — 2/3 */}
          <div className="lg:col-span-2 min-h-[280px] md:min-h-[360px] lg:min-h-[420px]">
            <SiteGalleryCarousel
              slides={site.gallerySlides ?? []}
              locale={locale}
              slidesPath="gallerySlides"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
