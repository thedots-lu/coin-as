'use client'

import { getLocalizedField } from '@/lib/locale'
import { LifecycleDiagramSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import EditableText from '@/components/admin/cms/EditableText'
import RichInlineText from '@/components/admin/cms/RichInlineText'
import { useEditing } from '@/components/admin/cms/EditingContext'
import BusinessContinuityDiagram from '@/components/sections/BusinessContinuityDiagram'

interface LifecycleDiagramProps {
  section: LifecycleDiagramSection
  locale: Locale
  basePath: string
}

export default function LifecycleDiagram({ section, locale, basePath }: LifecycleDiagramProps) {
  const isEditing = !!useEditing()
  const stepTitles = (section.steps ?? []).map((s) => getLocalizedField(s.title, locale))

  return (
    <section id="approach" className="bg-primary-950 text-white py-16 md:py-20 scroll-mt-24">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              <EditableText
                path={`${basePath}.heading`}
                value={section.heading}
                as="span"
                multiline
              />
            </h2>
            {(getLocalizedField(section.body, locale) || isEditing) && (
              <RichInlineText
                path={`${basePath}.body`}
                value={section.body}
                className="text-lg text-primary-200 leading-relaxed prose prose-invert max-w-none [&_p]:my-1"
              />
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="lg:sticky lg:top-24">
              <BusinessContinuityDiagram steps={stepTitles} theme="dark" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {(section.steps ?? []).map((step, index) => (
                <div
                  key={index}
                  className="relative bg-primary-900/50 rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="font-display text-lg font-bold text-white mb-2">
                    <EditableText
                      path={`${basePath}.steps.${index}.title`}
                      value={step.title}
                      as="span"
                    />
                  </h3>
                  <p className="text-primary-100 text-sm font-medium mb-2 leading-snug">
                    <EditableText
                      path={`${basePath}.steps.${index}.tagline`}
                      value={step.tagline}
                      as="span"
                      multiline
                    />
                  </p>
                  <RichInlineText
                    path={`${basePath}.steps.${index}.description`}
                    value={step.description}
                    className="text-primary-200/80 leading-relaxed text-sm prose prose-sm prose-invert max-w-none [&_p]:my-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
