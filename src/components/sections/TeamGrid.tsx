'use client'

import { getLocalizedField } from '@/lib/locale'
import { TeamsSection } from '@/lib/types/page'
import { TeamMember } from '@/lib/types/team'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import EditableText from '@/components/admin/cms/EditableText'
import EditableImage from '@/components/admin/cms/EditableImage'
import RichInlineText from '@/components/admin/cms/RichInlineText'
import { useEditing } from '@/components/admin/cms/EditingContext'

interface TeamGridProps {
  section: TeamsSection
  locale: Locale
  teamMembers: TeamMember[]
  basePath: string
}

export default function TeamGrid({ section, locale, basePath }: TeamGridProps) {
  const isEditing = !!useEditing()
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section
      id="teams"
      className="relative overflow-hidden py-20 scroll-mt-24"
      style={{ background: 'var(--color-surface-dark)' }}
    >
      {(section.imageUrl || isEditing) && (
        <div className="absolute inset-0">
          <EditableImage
            path={`${basePath}.imageUrl`}
            src={section.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            actionPlacement="bottom-right"
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
        {(heading || isEditing) && (
          <AnimatedSection animation="slideUp" className="text-center mb-8">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-warm-50)' }}
            >
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
          <AnimatedSection animation="slideUp" className="text-center">
            <RichInlineText
              path={`${basePath}.body`}
              value={section.body}
              className="text-lg mx-auto prose prose-lg prose-invert max-w-2xl [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2"
            />
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
