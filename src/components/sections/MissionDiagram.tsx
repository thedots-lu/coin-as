'use client'

import { getLocalizedField } from '@/lib/locale'
import { MissionSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Image from 'next/image'

interface MissionDiagramProps {
  section: MissionSection
  locale: Locale
}

export default function MissionDiagram({ section, locale }: MissionDiagramProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  const sourceSteps = section.diagramSteps.map((step) => getLocalizedField(step, locale))

  // Colors for each step in the cycle
  const sourceColors = [
    'bg-primary-600',
    'bg-primary-500',
    'bg-secondary-700',
    'bg-secondary-600',
    'bg-primary-700',
    'bg-primary-800',
  ]

  // Rotate the cycle one notch counter-clockwise: each label (and its color)
  // takes the position of the previous entry in the source order.
  const rotate = <T,>(arr: T[]): T[] =>
    arr.length > 0 ? [...arr.slice(1), arr[0]] : arr
  const steps = rotate(sourceSteps)
  const stepColors = rotate(sourceColors)

  return (
    <section id="mission" className="py-20 bg-warm-50 scroll-mt-24">
      <div className="container-padding">
        {section.imageUrl && (
          <AnimatedSection animation="slideUp" className="mb-12">
            <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg group">
              <Image
                src={section.imageUrl}
                alt="Our mission"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/70 via-secondary-900/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-start pl-8 md:pl-16">
                {heading && (
                  <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                    {heading}
                  </h2>
                )}
              </div>
            </div>
          </AnimatedSection>
        )}

        {!section.imageUrl && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            {heading && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
            )}
          </AnimatedSection>
        )}

        {body && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">{body}</p>
          </AnimatedSection>
        )}

        {steps.length > 0 && (
          <AnimatedSection animation="slideUp" delay={0.2}>
            {/* Circular layout for desktop, horizontal for mobile */}
            <div className="hidden md:block max-w-lg mx-auto">
              <div className="relative" style={{ paddingBottom: '100%' }}>
                {steps.map((step, index) => {
                  const total = steps.length
                  const angle = (index * 360) / total - 90 // Start from top
                  const radius = 42 // percentage from center
                  const x = 50 + radius * Math.cos((angle * Math.PI) / 180)
                  const y = 50 + radius * Math.sin((angle * Math.PI) / 180)

                  return (
                    <div
                      key={index}
                      className="absolute flex items-center justify-center"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className={`${stepColors[index % stepColors.length]} text-white w-28 h-28 rounded-full flex items-center justify-center text-center text-sm font-semibold shadow-lg transition-transform duration-300 hover:scale-110`}
                      >
                        <span className="px-2">{step}</span>
                      </div>
                    </div>
                  )
                })}
                {/* Center connecting arrows (visual indicator of cycle) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-secondary-300 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-secondary-400 animate-spin"
                      style={{ animationDuration: '8s' }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile layout: horizontal pipeline */}
            <div className="md:hidden flex flex-wrap justify-center gap-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`${stepColors[index % stepColors.length]} text-white px-5 py-3 rounded-full text-sm font-semibold shadow-md`}
                  >
                    {step}
                  </div>
                  {index < steps.length - 1 && (
                    <svg
                      className="w-5 h-5 text-secondary-400 mx-1 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
