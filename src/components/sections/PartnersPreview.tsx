'use client'

import { getLocalizedField } from '@/lib/locale'
import { PartnersPreviewSection } from '@/lib/types/page'
import { Partner } from '@/lib/types/partner'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import EditableText from '@/components/admin/cms/EditableText'
import EditableLink from '@/components/admin/cms/EditableLink'
import { useEditing } from '@/components/admin/cms/EditingContext'
import Link from 'next/link'

interface PartnersPreviewProps {
  section: PartnersPreviewSection
  locale: Locale
  partners: Partner[]
  basePath: string
}

export default function PartnersPreview({ section, locale, basePath }: PartnersPreviewProps) {
  const isEditing = !!useEditing()
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)
  const ctaText = getLocalizedField(section.ctaButtonText, locale)
  const showCta = !!section.ctaLink || isEditing

  return (
    <section id="partners" className="py-20 bg-warm-50 scroll-mt-24">
      <div className="container-padding">
        {(heading || isEditing) && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              <EditableText
                path={`${basePath}.heading`}
                value={section.heading}
                as="span"
                multiline
              />
            </h2>
          </AnimatedSection>
        )}

        {(body || isEditing) && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              <EditableText
                path={`${basePath}.body`}
                value={section.body}
                as="span"
                multiline
              />
            </p>
          </AnimatedSection>
        )}

        {showCta && (
          <div className="relative text-center inline-block left-1/2 -translate-x-1/2">
            <Link
              href={section.ctaLink || '#'}
              className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <EditableText
                path={`${basePath}.ctaButtonText`}
                value={section.ctaButtonText}
                placeholder={ctaText || 'View all partners'}
                as="span"
              />
            </Link>
            {isEditing && (
              <div className="absolute top-full left-0 mt-1 z-40">
                <EditableLink
                  path={`${basePath}.ctaLink`}
                  value={section.ctaLink}
                  label="CTA link"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
