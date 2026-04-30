'use client'

import { getLocalizedField } from '@/lib/locale'
import { MissionSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import EditableText from '@/components/admin/cms/EditableText'
import { useEditing } from '@/components/admin/cms/EditingContext'

interface MissionDiagramProps {
  section: MissionSection
  locale: Locale
  basePath: string
}

export default function MissionDiagram({ section, locale, basePath }: MissionDiagramProps) {
  const isEditing = !!useEditing()
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section id="mission" className="py-20 bg-secondary-50 scroll-mt-24">
      <div className="container-padding">
        {(heading || isEditing) && (
          <AnimatedSection animation="slideUp" className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
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
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto leading-relaxed">
              <EditableText
                path={`${basePath}.body`}
                value={section.body}
                as="span"
                multiline
              />
            </p>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
