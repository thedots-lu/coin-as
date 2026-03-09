'use client'

import { getLocalizedField } from '@/lib/locale'
import { FeaturesListSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import FlipCard from '@/components/ui/FlipCard'

interface FeaturesSectionProps {
  section: FeaturesListSection
  locale: Locale
}

export default function FeaturesSection({ section, locale }: FeaturesSectionProps) {
  const heading = getLocalizedField(section.heading, locale)

  return (
    <section className="py-20 bg-white">
      <div className="container-padding">
        {heading && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">{heading}</h2>
          </AnimatedSection>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.features.map((feature, index) => {
            const title = getLocalizedField(feature.title, locale)
            const description = getLocalizedField(feature.description, locale)

            return (
              <AnimatedSection
                key={index}
                animation="slideUp"
                delay={index * 0.1}
              >
                <FlipCard
                  className="h-56"
                  triggerOnHover
                  frontContent={
                    <div className="glass-card h-full flex items-center justify-center p-6 text-center">
                      <h3 className="text-xl font-semibold text-secondary-800">
                        {title}
                      </h3>
                    </div>
                  }
                  backContent={
                    <div className="h-full flex items-center justify-center p-6 text-center bg-primary-600 rounded-xl">
                      <p className="text-white leading-relaxed">{description}</p>
                    </div>
                  }
                />
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
