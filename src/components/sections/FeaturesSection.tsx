'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, RefreshCw } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { FeaturesListSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface FeaturesSectionProps {
  section: FeaturesListSection
  locale: Locale
}

const AUTO_FLIP_INTERVAL = 3500 // ms between auto flips
const AUTO_FLIP_DURATION = 2500 // ms each card stays flipped

export default function FeaturesSection({ section, locale }: FeaturesSectionProps) {
  const heading = getLocalizedField(section.heading, locale)
  const count = section.features.length

  const [autoIndex, setAutoIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)

  // Auto-flip loop: cycle through each card, showing the back briefly
  useEffect(() => {
    if (paused || count === 0) return

    let current = 0
    let timeoutId: ReturnType<typeof setTimeout>

    const cycle = () => {
      setAutoIndex(current)
      timeoutId = setTimeout(() => {
        setAutoIndex(null)
        timeoutId = setTimeout(() => {
          current = (current + 1) % count
          cycle()
        }, AUTO_FLIP_INTERVAL - AUTO_FLIP_DURATION)
      }, AUTO_FLIP_DURATION)
    }

    const initial = setTimeout(cycle, 1500)

    return () => {
      clearTimeout(initial)
      clearTimeout(timeoutId)
    }
  }, [count, paused])

  return (
    <section
      className="py-16 md:py-20 bg-warm-50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-padding">
        <div className="max-w-5xl mx-auto">
          {heading && (
            <AnimatedSection animation="slideUp" className="mb-12">
              <div className="w-12 h-1 bg-accent-500 rounded-full mb-5" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary-900 font-display leading-tight tracking-tight">
                {heading}
              </h2>
            </AnimatedSection>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {section.features.map((feature, index) => {
              const title = getLocalizedField(feature.title, locale)
              const description = getLocalizedField(feature.description, locale)

              const isFlipped = hoveredIndex === index || autoIndex === index

              return (
                <AnimatedSection
                  key={index}
                  animation="slideUp"
                  delay={index * 0.08}
                >
                  <div
                    className="relative h-52 cursor-pointer"
                    style={{ perspective: '1200px' }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <motion.div
                      className="relative w-full h-full"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* FRONT */}
                      <div
                        className="absolute inset-0 bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-secondary-100 flex flex-col"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                            <Check className="w-5 h-5 text-accent-600" strokeWidth={2.5} />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-primary-900 font-display leading-snug pt-1">
                            {title}
                          </h3>
                        </div>

                        {/* Flip indicator — bottom right */}
                        <div className="flex items-center justify-end gap-1.5 text-xs text-secondary-400 mt-4">
                          <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                          <span className="uppercase tracking-wider font-medium">Hover to flip</span>
                        </div>
                      </div>

                      {/* BACK */}
                      <div
                        className="absolute inset-0 bg-primary-950 rounded-2xl p-6 md:p-7 shadow-lg flex flex-col"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-accent-400" strokeWidth={2.5} />
                          </div>
                          <h4 className="text-sm font-bold text-accent-400 font-display leading-snug pt-1 uppercase tracking-wide">
                            {title}
                          </h4>
                        </div>
                        <p className="text-white/90 leading-relaxed text-sm md:text-[15px] flex-1">
                          {description}
                        </p>
                      </div>
                    </motion.div>
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
