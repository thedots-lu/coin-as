'use client'

import { getLocalizedField } from '@/lib/locale'
import { PartnersPreviewSection } from '@/lib/types/page'
import { Partner } from '@/lib/types/partner'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Link from 'next/link'
import Image from 'next/image'

interface PartnersPreviewProps {
  section: PartnersPreviewSection
  locale: Locale
  partners: Partner[]
}

export default function PartnersPreview({ section, locale }: PartnersPreviewProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section id="partners" className="py-20 bg-warm-50 scroll-mt-24">
      <div className="container-padding">
        {section.imageUrl && (
          <AnimatedSection animation="slideUp" className="mb-12">
            <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg group">
              <Image
                src={section.imageUrl}
                alt="Our partners"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/70 via-secondary-900/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-start pl-8 md:pl-16">
                {heading && (
                  <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                    {heading}
                  </h2>
                )}
              </div>
            </div>
          </AnimatedSection>
        )}

        {!section.imageUrl && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            {heading && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
            )}
          </AnimatedSection>
        )}

        {body && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">{body}</p>
          </AnimatedSection>
        )}

        {section.ctaLink && (
          <div className="text-center">
            <Link
              href={section.ctaLink}
              className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              {getLocalizedField(section.ctaButtonText, locale) || 'View all partners'}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
