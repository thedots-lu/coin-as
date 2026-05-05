'use client'

import { motion } from 'framer-motion'
import { getLocalizedField } from '@/lib/locale'
import { CTABannerSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Button from '@/components/ui/Button'
import EditableText from '@/components/admin/cms/EditableText'
import RichInlineText from '@/components/admin/cms/RichInlineText'
import { useEditing } from '@/components/admin/cms/EditingContext'

interface CTABannerProps {
  section: CTABannerSection
  locale: Locale
  basePath: string
}

export default function CTABanner({ section, locale, basePath }: CTABannerProps) {
  const isEditing = !!useEditing()
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)
  const buttonText = getLocalizedField(section.buttonText, locale)
  const showButton = !!buttonText || isEditing
  const theme = section.theme ?? 'light'
  const isDark = theme === 'dark'

  const sectionClass = isDark
    ? 'relative overflow-hidden bg-primary-950 text-white py-20'
    : 'relative overflow-hidden bg-white py-16 md:py-20'
  const containerClass = isDark
    ? 'container-padding relative text-center'
    : 'container-padding relative'
  const wrapperClass = isDark ? 'max-w-2xl mx-auto' : 'max-w-3xl'
  const accentClass = isDark
    ? 'w-12 h-1 bg-accent-500 mx-auto mb-6'
    : 'h-0.5 mb-8'
  const headingClass = isDark
    ? 'font-display tracking-tight leading-[1.1] text-white mb-4'
    : 'font-display tracking-tight leading-[1.1] text-primary-900 mb-8'
  const headingStyle = isDark
    ? { fontSize: 'clamp(1.875rem, 4vw, 2.5rem)', fontWeight: 700 }
    : { fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 700 }
  const bodyClass = isDark
    ? 'text-primary-200 text-lg max-w-xl mx-auto mb-8 leading-relaxed prose prose-invert max-w-none [&_p]:my-1'
    : 'text-secondary-700 text-lg leading-relaxed mb-8 prose max-w-none [&_p]:my-1'

  return (
    <section className={sectionClass}>
      <div className={containerClass}>
        <div className={wrapperClass}>
          {/* Top accent marker */}
          {isDark ? (
            <div className={accentClass} />
          ) : (
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={accentClass}
              style={{ background: 'var(--color-accent-500)' }}
            />
          )}

          {(heading || isEditing) && (
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={headingClass}
              style={headingStyle}
            >
              <EditableText
                path={`${basePath}.heading`}
                value={section.heading}
                as="span"
                multiline
              />
            </motion.h2>
          )}

          {(body || isEditing) && (
            <RichInlineText
              path={`${basePath}.body`}
              value={section.body ?? { en: '', fr: '', nl: '' }}
              className={bodyClass}
            />
          )}

          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={isDark ? 'flex justify-center' : ''}
            >
              <Button
                href={section.buttonLink}
                variant="primary"
                className="text-base px-8 py-4 !bg-accent-500 hover:!bg-accent-600 transition-all duration-300 group"
              >
                <EditableText
                  path={`${basePath}.buttonText`}
                  value={section.buttonText}
                  as="span"
                />
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
