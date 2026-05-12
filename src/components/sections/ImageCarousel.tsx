'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { ImageCarouselSection } from '@/lib/types/page'
import { Locale, LocaleString } from '@/lib/types/locale'
import EditableText from '@/components/admin/cms/EditableText'
import EditableImage from '@/components/admin/cms/EditableImage'
import { useEditing } from '@/components/admin/cms/EditingContext'

const INTERVAL = 5000
const EMPTY_LS: LocaleString = { en: '', fr: '', nl: '' }

interface Props {
  section: ImageCarouselSection
  locale: Locale
  basePath: string
}

export default function ImageCarousel({ section, locale, basePath }: Props) {
  const isEditing = !!useEditing()
  const slides = section.slides ?? []

  // Editor sees every slide (including hidden ones, marked visually); public
  // visitors only see slides that are both visible and have an imageUrl.
  const renderable = slides
    .map((slide, originalIdx) => ({ slide, originalIdx }))
    .filter(({ slide }) =>
      isEditing ? true : slide.visible !== false && !!slide.imageUrl,
    )

  const [active, setActive] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const total = renderable.length

  const next = useCallback(
    () => setActive((i) => (i + 1) % Math.max(1, total)),
    [total],
  )
  const prev = useCallback(
    () => setActive((i) => (i - 1 + Math.max(1, total)) % Math.max(1, total)),
    [total],
  )

  useEffect(() => {
    if (hoverPaused || isEditing || total <= 1) return
    const timer = setInterval(next, INTERVAL)
    return () => clearInterval(timer)
  }, [hoverPaused, isEditing, total, next])

  // Reset active index if slides change and current pointer is now out of bounds.
  useEffect(() => {
    if (active >= total && total > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(0)
    }
  }, [active, total])

  const headingValue: LocaleString = section.heading ?? EMPTY_LS
  const headingDisplayed = getLocalizedField(headingValue, locale)
  const showHeading = !!headingDisplayed || isEditing

  if (total === 0) {
    if (!isEditing) return null
    return (
      <section className="py-16 bg-warm-50">
        <div className="container-padding max-w-6xl mx-auto">
          <div className="rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 p-12 text-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">
              Image carousel has no slides yet. Open the section settings (cog icon) and click
              <strong> Add slide</strong> to start.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const activeIdx = Math.min(active, total - 1)
  const { slide: current, originalIdx } = renderable[activeIdx]
  const slidePath = `${basePath}.slides.${originalIdx}`
  const captionValue: LocaleString = current.caption ?? EMPTY_LS
  const captionDisplayed = getLocalizedField(captionValue, locale)
  const isHidden = current.visible === false

  return (
    <section className="py-16 bg-warm-50">
      <div className="container-padding max-w-6xl mx-auto">
        {showHeading && (
          <h2 className="text-3xl md:text-4xl font-bold text-black font-display tracking-tight mb-8 text-center">
            <EditableText
              path={`${basePath}.heading`}
              value={headingValue}
              placeholder="Section heading (optional)"
              as="span"
            />
          </h2>
        )}

        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100"
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
        >
          <div className="relative w-full aspect-[16/9]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${originalIdx}-${activeIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                {current.imageUrl ? (
                  <EditableImage
                    path={`${slidePath}.imageUrl`}
                    src={current.imageUrl}
                    alt={captionDisplayed || 'Carousel image'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-500">
                    <ImageIcon className="w-10 h-10 mb-2" />
                    <p className="text-sm">No image — click to upload</p>
                    <div className="absolute inset-0">
                      <EditableImage
                        path={`${slidePath}.imageUrl`}
                        src={null}
                        alt="Carousel image"
                        fill
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Bottom-left caption on dark gradient overlay */}
                {(captionDisplayed || isEditing) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent pt-16 pb-5 px-5 md:pt-20 md:pb-7 md:px-8 pointer-events-none">
                    <div className="pointer-events-auto max-w-3xl">
                      <EditableText
                        path={`${slidePath}.caption`}
                        value={captionValue}
                        placeholder="Caption"
                        as="span"
                        className="text-white text-base md:text-lg font-medium leading-snug drop-shadow"
                        multiline
                      />
                    </div>
                  </div>
                )}

                {isEditing && isHidden && (
                  <div className="absolute top-3 left-3 bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded pointer-events-none">
                    Hidden
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="absolute top-1/2 -translate-y-1/2 left-3 md:left-4 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-secondary-800 shadow flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="absolute top-1/2 -translate-y-1/2 right-3 md:right-4 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-secondary-800 shadow flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {total > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {renderable.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeIdx
                      ? 'bg-white w-6'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
