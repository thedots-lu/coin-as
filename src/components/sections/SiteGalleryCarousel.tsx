'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { Locale, LocaleString } from '@/lib/types/locale'
import EditableText from '@/components/admin/cms/EditableText'
import EditableImage from '@/components/admin/cms/EditableImage'
import { useEditing } from '@/components/admin/cms/EditingContext'

const INTERVAL = 5000
const EMPTY_LS: LocaleString = { en: '', fr: '', nl: '' }

export interface GallerySlide {
  imageUrl: string | null
  caption?: LocaleString
  visible?: boolean
}

interface Props {
  slides: GallerySlide[]
  locale: Locale
  /** Firestore path root for these slides, e.g. `gallerySlides`. Each slide
   *  is then addressed as `${slidesPath}.<i>.imageUrl` / `.caption`. */
  slidesPath: string
}

/**
 * Carousel rendered inside the right card of a per-site detail page. Same UX
 * as the section-level ImageCarousel (auto-play, dots, captions) but without
 * the outer section/heading wrapper — it fills its parent card edge-to-edge
 * and only renders one slide at a time so the photo stays large.
 */
export default function SiteGalleryCarousel({ slides, locale, slidesPath }: Props) {
  const isEditing = !!useEditing()

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
    return el.clientWidth
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

  useEffect(() => {
    if (hoverPaused || isEditing || total <= 1) return
    const timer = setInterval(next, INTERVAL)
    return () => clearInterval(timer)
  }, [hoverPaused, isEditing, total, next])

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

  useEffect(() => {
    if (activeIdx >= total && total > 0) goTo(0, 'auto')
  }, [activeIdx, total, goTo])

  if (total === 0) {
    if (!isEditing) return null
    return (
      <div className="w-full h-full min-h-[280px] rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8">
        <ImageIcon className="w-8 h-8 text-gray-400 mb-3" />
        <p className="text-gray-600 text-sm">
          No slides yet. Use the&nbsp;
          <strong>Manage gallery</strong> button in the editor toolbar to add some.
        </p>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg bg-gray-100"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {renderable.map(({ slide, originalIdx }) => {
          const captionValue: LocaleString = slide.caption ?? EMPTY_LS
          const captionText = getLocalizedField(captionValue, locale)
          const isHidden = slide.visible === false
          const slidePath = `${slidesPath}.${originalIdx}`

          return (
            <div
              key={originalIdx}
              className="snap-start shrink-0 basis-full relative"
            >
              {slide.imageUrl ? (
                <EditableImage
                  path={`${slidePath}.imageUrl`}
                  src={slide.imageUrl}
                  alt={captionText || 'Site image'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-500">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <p className="text-sm">Click to upload</p>
                  <div className="absolute inset-0">
                    <EditableImage
                      path={`${slidePath}.imageUrl`}
                      src={null}
                      alt="Site image"
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {(captionText || isEditing) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-5 px-5 md:pt-20 md:pb-6 md:px-7 pointer-events-none">
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
                <div className="absolute top-3 left-3 bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded pointer-events-none z-10">
                  Hidden
                </div>
              )}
            </div>
          )
        })}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute top-1/2 -translate-y-1/2 left-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-secondary-800 shadow flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute top-1/2 -translate-y-1/2 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-secondary-800 shadow flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {renderable.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === activeIdx
                  ? 'bg-white w-6'
                  : 'bg-white/70 w-2 hover:bg-white/90'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
