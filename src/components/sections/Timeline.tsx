'use client'

import { Lock } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { TimelineSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Badge from '@/components/ui/Badge'
import EditableText from '@/components/admin/cms/EditableText'
import { useEditing } from '@/components/admin/cms/EditingContext'
import { isHtml, sanitizeRichHtml } from '@/lib/utils/html'

interface TimelineProps {
  section: TimelineSection
  locale: Locale
  basePath: string
}

export default function Timeline({ section, locale, basePath }: TimelineProps) {
  const isEditing = !!useEditing()
  const events = section.events ?? []

  return (
    <section id="history" className="py-20 bg-secondary-50 scroll-mt-24">
      <div className="container-padding">
        <AnimatedSection animation="slideUp" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black">
            <EditableText
              path={`${basePath}.heading`}
              value={section.heading}
              as="span"
              multiline
            />
          </h2>
        </AnimatedSection>

        {isEditing && (
          <div className="max-w-3xl mx-auto mb-10 bg-amber-50 border border-amber-200 rounded-md px-4 py-2.5 text-[12px] text-amber-900 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>
              The events below are managed in{' '}
              <a
                href="/admin/timeline"
                className="font-semibold underline hover:no-underline"
              >
                Timeline
              </a>
              .
            </span>
          </div>
        )}

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-300 transform md:-translate-x-1/2" />

          {events.map((event, index) => {
            const title = getLocalizedField(event.title, locale)
            const description = getLocalizedField(event.description, locale)
            const isLeft = index % 2 === 0

            return (
              <AnimatedSection
                key={index}
                animation={isLeft ? 'slideRight' : 'slideLeft'}
                delay={index * 0.1}
                className="relative mb-12"
              >
                <div
                  className={`flex items-start ${
                    /* On mobile, always left-aligned. On desktop, alternate */
                    'ml-12 md:ml-0'
                  } ${
                    isLeft
                      ? 'md:flex-row md:pr-[calc(50%+2rem)]'
                      : 'md:flex-row-reverse md:pl-[calc(50%+2rem)]'
                  }`}
                >
                  {/* Dot on the line */}
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary-500 rounded-full transform -translate-x-1/2 mt-2 ring-4 ring-primary-100" />

                  <div className="glass-card p-6 w-full">
                    <Badge className="mb-3">{event.year}</Badge>
                    <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    {isHtml(description) ? (
                      <div
                        className="text-secondary-600 prose prose-sm max-w-none [&_p]:my-1 [&_a]:text-primary-600 [&_a]:underline hover:[&_a]:text-primary-700"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(description) }}
                      />
                    ) : (
                      <p className="text-secondary-600">{description}</p>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
