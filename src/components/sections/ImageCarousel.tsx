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
  // How many slides fit in the visible window. Defaults to 1 until the ref
  // is attached; gets updated by the ResizeObserver below.
  const [visibleCount, setVisibleCount] = useState(1)
  const total = renderable.length
  // The last "page" index the user can land on: with 5 slides and 3 visible
  // simultaneously, the rightmost valid start is slide 2 (showing 2-3-4).
  // Going further would scroll past the edge and silently clamp.
  const maxIdx = Math.max(0, total - visibleCount)
  const pageCount = maxIdx + 1

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
    const nextIdx = activeIdx >= maxIdx ? 0 : activeIdx + 1
    setActiveIdx(nextIdx)
    goTo(nextIdx)
  }, [activeIdx, total, maxIdx, goTo])

  const prev = useCallback(() => {
    if (total === 0) return
    const prevIdx = activeIdx <= 0 ? maxIdx : activeIdx - 1
    setActiveIdx(prevIdx)
    goTo(prevIdx)
  }, [activeIdx, total, maxIdx, goTo])

  // Auto-play. Skipped in editor mode and when there's only one page worth.
  useEffect(() => {
    if (hoverPaused || isEditing || pageCount <= 1) return
    const timer = setInterval(next, INTERVAL)
    return () => clearInterval(timer)
  }, [hoverPaused, isEditing, pageCount, next])

  // Detect how many slides currently fit on screen so next/prev/dots know
  // when to wrap. Re-runs on resize and whenever the slide set changes.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const computeVisible = () => {
      const w = getSlideWidth()
      if (w === 0) return
      // +0.5 absorbs sub-pixel rounding so 2.97 doesn't collapse to 2.
      const count = Math.max(1, Math.floor(el.clientWidth / w + 0.5))
      setVisibleCount(count)
    }
    computeVisible()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(computeVisible)
    ro.observe(el)
    return () => ro.disconnect()
  }, [getSlideWidth, total])

  // Sync activeIdx with the user's manual scroll position so the dots stay
  // accurate when scrolling/swiping by hand. Clamps to maxIdx, not total-1,
  // because positions past maxIdx can't actually be scrolled to.
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
        const clamped = Math.max(0, Math.min(idx, maxIdx))
        setActiveIdx((prev) => (prev === clamped ? prev : clamped))
      }, 100)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [total, maxIdx, getSlideWidth])

  // Snap back if slides shrink or visibleCount grows and the current index
  // is no longer reachable.
  useEffect(() => {
    if (activeIdx > maxIdx) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIdx(maxIdx)
      goTo(maxIdx, 'auto')
    }
  }, [activeIdx, maxIdx, goTo])

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

          {/* Arrows. Hidden when every slide fits on screen at once — i.e.
              when there's only one "page" to navigate to. */}
          {pageCount > 1 && (
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

        {/* Dots — one per scrollable "page", not per slide, so we don't get
            unreachable indices on the right end. */}
        {pageCount > 1 && (
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setActiveIdx(i)
                  goTo(i)
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-colors duration-300 ${
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
