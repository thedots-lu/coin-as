'use client'

import { getLocalizedField } from '@/lib/locale'
import { CustomersSection as CustomersSectionType } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { motion } from 'framer-motion'

interface CustomersSectionProps {
  section: CustomersSectionType
  locale: Locale
}

export default function CustomersSection({ section, locale }: CustomersSectionProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)
  const logos = (section.logoUrls ?? []).filter((url) => url && url.length > 0)

  return (
    <section id="customers" className="py-20 bg-warm-100/60 overflow-hidden scroll-mt-24">
      <div className="container-padding">
        <AnimatedSection animation="slideUp" className="text-center mb-6">
          {heading && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          )}
        </AnimatedSection>

        {body && (
          <AnimatedSection animation="slideUp" className="text-center mb-12">
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">{body}</p>
          </AnimatedSection>
        )}
      </div>

      {/* Marquee — infinite scrolling logos */}
      {logos.length > 0 && (
        <div className="relative mx-8 md:mx-16 lg:mx-24">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-warm-100/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-warm-100/60 to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden">
            <motion.div
              className="flex items-center gap-20 py-8"
              animate={{ x: [0, -(logos.length * 220)] }}
              transition={{
                x: { duration: logos.length * 3.5, repeat: Infinity, ease: 'linear' },
              }}
            >
              {[...logos, ...logos, ...logos].map((url, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex items-center justify-center w-[180px] h-[120px]"
                >
                  <img
                    src={url}
                    alt={`Customer ${(i % logos.length) + 1}`}
                    className="max-h-[100px] max-w-[170px] object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {logos.length === 0 && (
        <div className="text-center container-padding">
          <p className="text-secondary-500">
            Trusted by leading organizations across the BeNeLux.
          </p>
        </div>
      )}
    </section>
  )
}
