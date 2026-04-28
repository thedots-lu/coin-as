'use client'

import { getLocalizedField } from '@/lib/locale'
import { TeamsSection } from '@/lib/types/page'
import { TeamMember } from '@/lib/types/team'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface TeamGridProps {
  section: TeamsSection
  locale: Locale
  teamMembers: TeamMember[]
}

export default function TeamGrid({ section, locale }: TeamGridProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section id="teams" className="py-20 bg-secondary-50 scroll-mt-24">
      <div className="container-padding">
        {heading && (
          <AnimatedSection animation="slideUp" className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">{heading}</h2>
          </AnimatedSection>
        )}

        {body && (
          <AnimatedSection animation="slideUp" className="text-center">
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">{body}</p>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
