'use client'

import { getLocalizedField } from '@/lib/locale'
import { TimelineSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Badge from '@/components/ui/Badge'

interface TimelineProps {
  section: TimelineSection
  locale: Locale
}

export default function Timeline({ section, locale }: TimelineProps) {
  const heading = getLocalizedField(section.heading, locale)

  return (
    <section className="py-20 bg-secondary-50">
      <div className="container-padding">
        <AnimatedSection animation="slideUp" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">{heading}</h2>
        </AnimatedSection>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-300 transform md:-translate-x-1/2" />

          {section.events.map((event, index) => {
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
                    <p className="text-secondary-600">{description}</p>
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
