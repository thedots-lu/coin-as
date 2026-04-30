'use client'

import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { TeamsSection } from '@/lib/types/page'
import { TeamMember } from '@/lib/types/team'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { isAvifUrl } from '@/lib/utils/image'

interface TeamGridProps {
  section: TeamsSection
  locale: Locale
  teamMembers: TeamMember[]
}

export default function TeamGrid({ section, locale }: TeamGridProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section
      id="teams"
      className="relative overflow-hidden py-20 scroll-mt-24"
      style={{ background: 'var(--color-surface-dark)' }}
    >
      {section.imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={section.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized={isAvifUrl(section.imageUrl)}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to right, rgba(11,26,46,0.95) 0%, rgba(11,26,46,0.85) 40%, rgba(11,26,46,0.6) 100%)',
            }}
          />
        </div>
      )}

      <div className="container-padding relative z-10">
        {heading && (
          <AnimatedSection animation="slideUp" className="text-center mb-8">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-warm-50)' }}
            >
              {heading}
            </h2>
          </AnimatedSection>
        )}

        {body && (
          <AnimatedSection animation="slideUp" className="text-center">
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-secondary-300)' }}
            >
              {body}
            </p>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
