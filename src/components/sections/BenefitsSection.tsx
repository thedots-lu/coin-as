'use client'

import { getLocalizedField } from '@/lib/locale'
import { BenefitsSection as BenefitsSectionType } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface BenefitsSectionProps {
  section: BenefitsSectionType
  locale: Locale
}

export default function BenefitsSection({ section, locale }: BenefitsSectionProps) {
  const heading = getLocalizedField(section.heading, locale)

  return (
    <section className="py-20 bg-warm-50">
      <div className="container-padding">
        {heading && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">{heading}</h2>
          </AnimatedSection>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {section.items.map((item, index) => {
            const title = getLocalizedField(item.title, locale)
            const description = getLocalizedField(item.description, locale)

            return (
              <AnimatedSection
                key={index}
                animation="slideUp"
                delay={index * 0.1}
              >
                <div className="glass-card p-6 h-full">
                  <h3 className="text-lg font-semibold text-secondary-800 mb-2">
                    {title}
                  </h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
