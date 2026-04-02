'use client'

import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { InnovationSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import { motion } from 'framer-motion'

interface InnovationBlockProps {
  section: InnovationSection
  locale: Locale
}

export default function InnovationBlock({ section, locale }: InnovationBlockProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="relative py-28 md:py-36 overflow-hidden" style={{ background: 'var(--color-primary-950)' }}>
      {/* Architectural grid lines -- subtle background texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 120px)',
          }}
        />
      </div>


      <div className="container-padding relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-20">
            {/* Text column -- offset down for asymmetry */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={section.imageUrl ? 'lg:w-[45%] lg:pt-12' : 'max-w-3xl mx-auto'}
            >
              {/* Stacked label with vertical accent */}
              <div className="flex items-stretch gap-4 mb-8">
                <div
                  className="w-1 rounded-full shrink-0"
                  style={{
                    background: 'linear-gradient(to bottom, var(--color-primary-500), var(--color-primary-200))',
                  }}
                />
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-400 font-display">
                    Since 2004
                  </span>
                  <span className="text-xs tracking-[0.15em] uppercase text-primary-300 mt-0.5">
                    Proven Track Record
                  </span>
                </div>
              </div>

              {heading && (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
                  {heading}
                </h2>
              )}

              {body && (
                <p className="text-primary-200 leading-relaxed text-lg md:text-xl max-w-xl">
                  {body}
                </p>
              )}

              {/* Horizontal rule with data points feel */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 origin-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-px flex-grow bg-gradient-to-r from-primary-500/40 via-primary-400/20 to-transparent" />
                  <div className="w-2 h-2 rounded-full bg-primary-400/60" />
                </div>
              </motion.div>
            </motion.div>

            {/* Image column -- full-bleed feel with diagonal clip */}
            {section.imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="lg:w-[55%] w-full"
              >
                <div className="relative group">
                  {/* Shadow layer offset for depth */}
                  <div
                    className="absolute -bottom-4 -right-4 w-full h-full rounded-xl"
                    style={{ background: 'var(--color-primary-800)' }}
                  />
                  <div className="relative rounded-xl overflow-hidden">
                    <div className="aspect-[16/10] relative">
                      <Image
                        src={section.imageUrl}
                        alt={heading || ''}
                        fill
                        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                        sizes="(max-width: 1024px) 100vw, 55vw"
                      />
                      {/* Cool-tone overlay for editorial cohesion */}
                      <div
                        className="absolute inset-0 mix-blend-multiply opacity-15 transition-opacity duration-700 group-hover:opacity-5"
                        style={{
                          background: 'linear-gradient(160deg, var(--color-primary-700), transparent 60%)',
                        }}
                      />
                    </div>
                    {/* Top accent stripe */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-300), transparent)',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
