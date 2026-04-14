'use client'

import { Check } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { FeaturesListSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface FeaturesSectionProps {
  section: FeaturesListSection
  locale: Locale
}

export default function FeaturesSection({ section, locale }: FeaturesSectionProps) {
  const heading = getLocalizedField(section.heading, locale)

  return (
    <section className="py-16 md:py-20 bg-warm-50">
      <div className="container-padding">
        <div className="max-w-5xl mx-auto">
          {heading && (
            <AnimatedSection animation="slideUp" className="mb-12">
              <div className="w-12 h-1 bg-accent-500 rounded-full mb-5" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary-900 font-display leading-tight tracking-tight">
                {heading}
              </h2>
            </AnimatedSection>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {section.features.map((feature, index) => {
              const title = getLocalizedField(feature.title, locale)
              const description = getLocalizedField(feature.description, locale)

              return (
                <AnimatedSection key={index} animation="slideUp" delay={index * 0.08}>
                  <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-secondary-100 h-full hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-accent-600" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-primary-900 font-display leading-snug pt-1">
                        {title}
                      </h3>
                    </div>
                    <p className="text-secondary-600 leading-relaxed text-sm md:text-base ml-14">
                      {description}
                    </p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
