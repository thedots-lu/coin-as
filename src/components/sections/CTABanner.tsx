'use client'

import { motion } from 'framer-motion'
import { getLocalizedField } from '@/lib/locale'
import { CTABannerSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Button from '@/components/ui/Button'

interface CTABannerProps {
  section: CTABannerSection
  locale: Locale
}

export default function CTABanner({ section, locale }: CTABannerProps) {
  const heading = getLocalizedField(section.heading, locale)
  const buttonText = getLocalizedField(section.buttonText, locale)

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--color-surface-dark)' }}>
      {/* Layered background: diagonal gradient wash */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary gradient -- uses surface tokens */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-surface-darkest) 0%, var(--color-surface-dark) 40%, var(--color-primary-950) 100%)',
          }}
        />
        {/* Accent line -- sharp diagonal */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, transparent 48%, rgba(245,158,11,0.06) 49%, rgba(245,158,11,0.06) 51%, transparent 52%, transparent 100%)',
          }}
        />
        {/* Noise-like texture via subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 0.5px, transparent 0.5px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Glow source -- bottom right */}
        <div
          className="absolute -bottom-24 -right-24 w-[32rem] h-[32rem] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(14,158,239,0.08) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="container-padding relative py-24 md:py-32">
        <div className="max-w-3xl">
          {/* Top accent marker */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 48 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-0.5 mb-10"
            style={{ background: 'var(--color-accent-400)' }}
          />

          {/* Heading -- bold, left-aligned, editorial */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display tracking-tight leading-[1.1] text-white mb-10"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 700 }}
          >
            {heading}
          </motion.h2>

          {/* CTA button */}
          {buttonText && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Button
                href={section.buttonLink}
                variant="outline"
                className="border-white/30 text-white text-base px-8 py-4 hover:border-accent-400 hover:bg-accent-400/10 hover:text-accent-300 transition-all duration-300 group"
              >
                <span>{buttonText}</span>
                <svg
                  className="ml-3 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom edge line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }}
      />
    </section>
  )
}
