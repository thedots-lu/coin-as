'use client'

import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { FlexibleServicesSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import { motion } from 'framer-motion'

interface FlexibleServicesProps {
  section: FlexibleServicesSection
  locale: Locale
  background?: string
}

export default function FlexibleServices({ section, locale, background = 'var(--color-warm-50)' }: FlexibleServicesProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="relative py-28 md:py-36 overflow-hidden" style={{ background }}>
      {/* Precision dot grid -- evokes configurability and modular systems */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--color-secondary-600) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Floating geometric accents */}
      <motion.div
        initial={{ opacity: 0, rotate: -8 }}
        whileInView={{ opacity: 0.07, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute -top-20 -right-20 w-80 h-80 rounded-3xl border-2 pointer-events-none"
        style={{ borderColor: 'var(--color-secondary-300)' }}
      />
      <motion.div
        initial={{ opacity: 0, rotate: 8 }}
        whileInView={{ opacity: 0.05, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-3xl border-2 pointer-events-none"
        style={{ borderColor: 'var(--color-primary-300)' }}
      />

      <div className="container-padding relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Reversed layout: image left, text right */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-20">
            {/* Text column */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={section.imageUrl ? 'lg:w-1/2' : 'max-w-3xl mx-auto'}
            >
              {/* Horizontal tag-style label with pill shape */}
              <div className="mb-8 flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.15em] uppercase font-display"
                  style={{
                    background: 'var(--color-secondary-100)',
                    color: 'var(--color-secondary-700)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--color-accent-500)' }}
                  />
                  Tailored SLA
                </span>
                <div
                  className="h-px flex-grow max-w-24"
                  style={{ background: 'linear-gradient(90deg, var(--color-secondary-200), transparent)' }}
                />
              </div>

              {heading && (
                <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-secondary-800 mb-8 leading-[1.15] tracking-tight">
                  {heading}
                </h2>
              )}

              {body && (
                <p className="text-secondary-500 leading-relaxed text-lg max-w-lg">{body}</p>
              )}

              {/* Three-column micro-stats row to reinforce precision */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 grid grid-cols-3 gap-4 max-w-sm"
              >
                {[
                  { value: '99.9%', label: 'Uptime' },
                  { value: '24/7', label: 'Support' },
                  { value: '<4h', label: 'Response' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div
                      className="text-xl md:text-2xl font-bold font-display"
                      style={{ color: 'var(--color-primary-600)' }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-secondary-400 uppercase tracking-wider mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Image column -- card style with inset border */}
            {section.imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, x: -30 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="lg:w-1/2 w-full"
              >
                <div className="relative group">
                  {/* Inset border frame for a technical, precise feel */}
                  <div
                    className="absolute inset-3 rounded-xl border-2 pointer-events-none z-20 transition-all duration-700 group-hover:inset-4"
                    style={{ borderColor: 'rgba(255,255,255,0.4)' }}
                  />
                  <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src={section.imageUrl}
                        alt={heading || ''}
                        fill
                        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div
                        className="absolute inset-0 opacity-20 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-8"
                        style={{
                          background:
                            'linear-gradient(to bottom right, var(--color-secondary-700), transparent 70%)',
                        }}
                      />
                    </div>
                    {/* Bottom accent bar -- segmented for modular feel */}
                    <div className="absolute bottom-0 left-0 right-0 flex h-1">
                      <div className="flex-1" style={{ background: 'var(--color-secondary-500)' }} />
                      <div className="w-1" />
                      <div className="flex-1" style={{ background: 'var(--color-primary-500)' }} />
                      <div className="w-1" />
                      <div className="flex-1" style={{ background: 'var(--color-accent-500)' }} />
                    </div>
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
