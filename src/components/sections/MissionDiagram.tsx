'use client'

import { getLocalizedField } from '@/lib/locale'
import { MissionSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import BusinessContinuityDiagram from '@/components/sections/BusinessContinuityDiagram'

interface MissionDiagramProps {
  section: MissionSection
  locale: Locale
}

export default function MissionDiagram({ section, locale }: MissionDiagramProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)
  const steps = section.diagramSteps.map((step) => getLocalizedField(step, locale))

  return (
    <section id="mission" className="py-20 bg-secondary-50 scroll-mt-24">
      <div className="container-padding">
        {heading && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">{heading}</h2>
          </AnimatedSection>
        )}

        {body && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">{body}</p>
          </AnimatedSection>
        )}

        {steps.length > 0 && (
          <AnimatedSection animation="slideUp" delay={0.2}>
            <BusinessContinuityDiagram steps={steps} theme="light" />
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
