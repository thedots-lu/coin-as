'use client'

import { Site } from '@/lib/types/site'
import { Locale, LocaleString } from '@/lib/types/locale'
import { getLocalizedField } from '@/lib/locale'
import { isHtml, sanitizeRichHtml } from '@/lib/utils/html'
import RichInlineText from '@/components/admin/cms/RichInlineText'
import { useEditing } from '@/components/admin/cms/EditingContext'
import SiteGalleryCarousel from './SiteGalleryCarousel'

const EMPTY_LS: LocaleString = { en: '', fr: '', nl: '' }

interface Props {
  site: Site
  locale: Locale
}

/**
 * Top block of a per-site detail page: a 1/3 description card on the left
 * and a 2/3 image carousel card on the right (stacked on mobile/tablet).
 * The description is the existing Site.description; gallery slides live on
 * Site.gallerySlides — both are inline-editable in the visual editor.
 */
export default function SiteIntroCards({ site, locale }: Props) {
  const isEditing = !!useEditing()
  const description: LocaleString = site.description ?? EMPTY_LS
  const descriptionText = getLocalizedField(description, locale)

  return (
    <section className="py-12 md:py-16 bg-warm-50">
      <div className="container-padding max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Description card — 1/3 */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 md:p-8 flex flex-col">
            <div className="w-12 h-1 bg-accent-500 rounded-full mb-4" />
            {(descriptionText || isEditing) && (
              isHtml(descriptionText) ? (
                <RichInlineText
                  path="description"
                  value={description}
                  className="text-secondary-700 leading-relaxed prose prose-sm max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5"
                />
              ) : (
                <RichInlineText
                  path="description"
                  value={description}
                  className="text-secondary-700 leading-relaxed prose prose-sm max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5"
                />
              )
            )}
            {!descriptionText && !isEditing && (
              // Render nothing when there's no description on the public site
              // (the card stays for symmetry on the page; could remove later).
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
