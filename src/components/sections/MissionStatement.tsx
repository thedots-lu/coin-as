'use client'

import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { MissionStatementSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import { motion } from 'framer-motion'

interface MissionStatementProps {
  section: MissionStatementSection
  locale: Locale
}

export default function MissionStatement({ section, locale }: MissionStatementProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--color-surface-dark)' }}>
      {/* Full-width cinematic layout -- dark background, bold statement */}

      {/* Background image as full bleed with heavy overlay */}
      {section.imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={section.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          {/* Dark gradient overlay for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(11,26,46,0.95) 0%, rgba(11,26,46,0.85) 40%, rgba(11,26,46,0.6) 100%)',
            }}
          />
        </div>
      )}

      {/* Diagonal accent line -- architectural detail */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        whileInView={{ opacity: 0.1, scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 right-[20%] w-px h-full origin-top pointer-events-none hidden lg:block"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--color-primary-400), transparent)' }}
      />

      <div className="container-padding relative z-10 py-32 md:py-40 lg:py-48">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Accent bar above heading */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="origin-left mb-10"
            >
              <div
                className="w-20 h-1 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--color-accent-400), var(--color-accent-500))',
                }}
              />
            </motion.div>

            {/* Large editorial heading */}
            {heading && (
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-10"
                style={{ color: 'var(--color-warm-50)' }}
              >
                {heading}
              </motion.h2>
            )}

            {body && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg md:text-xl leading-relaxed max-w-2xl"
                style={{ color: 'var(--color-secondary-300)' }}
              >
                {body}
              </motion.p>
            )}

            {/* Bottom decorative element -- three stacked lines fading out */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-14 flex flex-col gap-2"
            >
              <div className="h-px w-32" style={{ background: 'rgba(255,255,255,0.2)' }} />
              <div className="h-px w-20" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="h-px w-10" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom edge gradient transition back to light sections */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, var(--color-accent-500), var(--color-primary-500), transparent)',
        }}
      />
    </section>
  )
}
