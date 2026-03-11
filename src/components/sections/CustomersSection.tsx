'use client'

import { getLocalizedField } from '@/lib/locale'
import { CustomersSection as CustomersSectionType } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Image from 'next/image'

interface CustomersSectionProps {
  section: CustomersSectionType
  locale: Locale
}

export default function CustomersSection({ section, locale }: CustomersSectionProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="py-20 bg-warm-100/60">
      <div className="container-padding">
        {section.imageUrl && (
          <AnimatedSection animation="slideUp" className="mb-12">
            <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg group">
              <Image
                src={section.imageUrl}
                alt="Our customers"
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

        {section.logoUrls && section.logoUrls.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {section.logoUrls.map((url, index) => (
              <AnimatedSection
                key={index}
                animation="slideUp"
                delay={index * 0.05}
              >
                <div className="flex items-center justify-center p-4">
                  <img
                    src={url}
                    alt={`Customer ${index + 1}`}
                    className="max-h-12 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-secondary-500">
              Trusted by leading organizations across the BeNeLux.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
