'use client'

import { getLocalizedField } from '@/lib/locale'
import { ProcessPipelineSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface ProcessPipelineProps {
  section: ProcessPipelineSection
  locale: Locale
}

export default function ProcessPipeline({ section, locale }: ProcessPipelineProps) {
  return (
    <section className="py-20">
      <div className="container-padding">
        {/* Desktop: horizontal pipeline */}
        <div className="hidden md:flex items-start justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-primary-200" />

          {section.steps.map((step, index) => {
            const title = getLocalizedField(step.title, locale)
            const description = getLocalizedField(step.description, locale)

            return (
              <AnimatedSection
                key={index}
                animation="slideUp"
                delay={index * 0.15}
                className="relative flex-1 px-4 text-center"
              >
                <div className="relative z-10 w-16 h-16 mx-auto rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold shadow-lg mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-secondary-600">{description}</p>
              </AnimatedSection>
            )
          })}
        </div>

        {/* Mobile: vertical pipeline */}
        <div className="md:hidden relative">
          {/* Vertical connecting line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200" />

          <div className="space-y-8">
            {section.steps.map((step, index) => {
              const title = getLocalizedField(step.title, locale)
              const description = getLocalizedField(step.description, locale)

              return (
                <AnimatedSection
                  key={index}
                  animation="slideRight"
                  delay={index * 0.1}
                  className="relative flex items-start gap-4"
                >
                  <div className="relative z-10 w-16 h-16 shrink-0 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-secondary-600">{description}</p>
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
