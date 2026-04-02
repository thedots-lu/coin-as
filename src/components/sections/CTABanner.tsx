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
    <section className="relative overflow-hidden bg-white">
      <div className="container-padding relative py-16 md:py-20">
        <div className="max-w-3xl">
          {/* Top accent marker */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 48 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-0.5 mb-8"
            style={{ background: 'var(--color-accent-500)' }}
          />

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display tracking-tight leading-[1.1] text-primary-900 mb-8"
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
                variant="primary"
                className="text-base px-8 py-4 !bg-accent-500 hover:!bg-accent-600 transition-all duration-300 group"
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
    </section>
  )
}
