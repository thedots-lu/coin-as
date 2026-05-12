'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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

  // Editor sees every slide; public visitors only see visible slides with an
  // imageUrl (an empty placeholder slide is useless on the public site).
  const renderable = slides
    .map((slide, originalIdx) => ({ slide, originalIdx }))
    .filter(({ slide }) =>
      isEditing ? true : slide.visible !== false && !!slide.imageUrl,
    )

  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const total = renderable.length

  const getSlideWidth = useCallback(() => {
    const el = trackRef.current
    if (!el) return 0
    const firstCard = el.querySelector<HTMLElement>('[data-carousel-slide]')
    if (!firstCard) return el.clientWidth
    const style = window.getComputedStyle(el)
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0
    return firstCard.offsetWidth + gap
  }, [])

  const goTo = useCallback(
    (idx: number, behavior: ScrollBehavior = 'smooth') => {
      const el = trackRef.current
      if (!el) return
      const w = getSlideWidth()
      if (w === 0) return
      el.scrollTo({ left: idx * w, behavior })
    },
    [getSlideWidth],
  )

  const next = useCallback(() => {
    if (total === 0) return
    goTo((activeIdx + 1) % total)
  }, [activeIdx, total, goTo])

  const prev = useCallback(() => {
    if (total === 0) return
    goTo((activeIdx - 1 + total) % total)
  }, [activeIdx, total, goTo])

  // Auto-play. Skipped in editor mode and when paused or only one slide.
  useEffect(() => {
    if (hoverPaused || isEditing || total <= 1) return
    const timer = setInterval(next, INTERVAL)
    return () => clearInterval(timer)
  }, [hoverPaused, isEditing, total, next])

  // Sync activeIdx with the user's manual scroll position so the dots stay
  // accurate when scrolling/swiping by hand.
  useEffect(() => {
    const el = trackRef.current
    if (!el || total === 0) return
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const w = getSlideWidth()
        if (w === 0) return
        const idx = Math.round(el.scrollLeft / w)
        const clamped = Math.max(0, Math.min(idx, total - 1))
        setActiveIdx((prev) => (prev === clamped ? prev : clamped))
      }, 100)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [total, getSlideWidth])

  // Reset scroll position if slides shrink and the current index is now OOB.
  useEffect(() => {
    if (activeIdx >= total && total > 0) goTo(0, 'auto')
  }, [activeIdx, total, goTo])

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
          className="relative"
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
        >
          <div
            ref={trackRef}
            className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none' }}
          >
            {renderable.map(({ slide, originalIdx }) => {
              const captionValue: LocaleString = slide.caption ?? EMPTY_LS
              const captionText = getLocalizedField(captionValue, locale)
              const isHidden = slide.visible === false
              const slidePath = `${basePath}.slides.${originalIdx}`

              return (
                <div
                  key={originalIdx}
                  data-carousel-slide
                  className="snap-start shrink-0 basis-full md:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]"
                >
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                    {slide.imageUrl ? (
                      <EditableImage
                        path={`${slidePath}.imageUrl`}
                        src={slide.imageUrl}
                        alt={captionText || 'Carousel image'}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-500">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <p className="text-xs">Click to upload</p>
                        <div className="absolute inset-0">
                          <EditableImage
                            path={`${slidePath}.imageUrl`}
                            src={null}
                            alt="Carousel image"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Bottom-left caption on dark gradient overlay */}
                    {(captionText || isEditing) && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4 px-4 md:pt-14 md:pb-5 md:px-5 pointer-events-none">
                        <div className="pointer-events-auto">
                          <EditableText
                            path={`${slidePath}.caption`}
                            value={captionValue}
                            placeholder="Caption"
                            as="span"
                            className="text-white text-sm md:text-base font-medium leading-snug drop-shadow"
                            multiline
                          />
                        </div>
                      </div>
                    )}

                    {isEditing && isHidden && (
                      <div className="absolute top-3 left-3 bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded pointer-events-none z-10">
                        Hidden
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Arrows. Hidden when every slide fits on screen at once (single
              slide, or fewer slides than the LG viewport shows). */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="absolute top-1/2 -translate-y-1/2 left-2 md:-left-4 w-10 h-10 rounded-full bg-white shadow-md border border-secondary-100 text-secondary-800 flex items-center justify-center hover:border-primary-500 hover:text-primary-600 transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="absolute top-1/2 -translate-y-1/2 right-2 md:-right-4 w-10 h-10 rounded-full bg-white shadow-md border border-secondary-100 text-secondary-800 flex items-center justify-center hover:border-primary-500 hover:text-primary-600 transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {renderable.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === activeIdx
                    ? 'bg-primary-600 w-6'
                    : 'bg-secondary-300 w-2 hover:bg-secondary-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
