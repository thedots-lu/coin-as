'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { Testimonial } from '@/lib/types/testimonial'
import { Locale, LocaleString } from '@/lib/types/locale'

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
  heading?: LocaleString
  locale: Locale
}

export default function TestimonialsCarousel({
  testimonials,
  heading,
  locale,
}: TestimonialsCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [progress, setProgress] = useState(0)
  const touchStartX = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = testimonials.length
  const AUTOPLAY_MS = 8000
  const PROGRESS_TICK = 50

  const resetProgress = useCallback(() => {
    setProgress(0)
    if (progressRef.current) clearInterval(progressRef.current)
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (PROGRESS_TICK / AUTOPLAY_MS) * 100
        return next >= 100 ? 100 : next
      })
    }, PROGRESS_TICK)
  }, [])

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    resetProgress()
    intervalRef.current = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % total)
      resetProgress()
    }, AUTOPLAY_MS)
  }, [total, resetProgress])

  useEffect(() => {
    if (total <= 1) return
    startAutoPlay()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [total, startAutoPlay])

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
    startAutoPlay()
  }

  const goNext = () => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % total)
    startAutoPlay()
  }

  const goPrev = () => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + total) % total)
    startAutoPlay()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  if (total === 0) return null

  const headingText = heading ? getLocalizedField(heading, locale) : ''
  const t = testimonials[current]

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      filter: 'blur(4px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      filter: 'blur(4px)',
    }),
  }

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-warm-50">
      {/* Subtle background texture -- diagonal fine lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0,0,0,1) 10px, rgba(0,0,0,1) 11px)',
        }}
      />

      {/* Accent glow -- top-right corner, very subtle */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-200/30 blur-3xl pointer-events-none" />

      <div className="container-padding relative z-10">
        {/* Header row: label + heading + counter */}
        <div className="max-w-5xl mx-auto mb-16 md:mb-20">
          <div className="flex items-end justify-between gap-8">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-primary-600 mb-4"
              >
                Testimonials
              </motion.span>
              {headingText && (
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-800 tracking-tight leading-[1.1]"
                >
                  {headingText}
                </motion.h2>
              )}
            </div>

            {/* Slide counter -- editorial style */}
            {total > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="hidden md:flex items-baseline gap-1 text-secondary-400 font-display shrink-0"
              >
                <span className="text-3xl font-bold text-secondary-800 tabular-nums">
                  {String(current + 1).padStart(2, '0')}
                </span>
                <span className="text-sm mx-1 text-secondary-400">/</span>
                <span className="text-sm tabular-nums text-secondary-400">
                  {String(total).padStart(2, '0')}
                </span>
              </motion.div>
            )}
          </div>

          {/* Thin separator line */}
          <div className="mt-8 h-px bg-secondary-200" />
        </div>

        {/* Main testimonial area */}
        <div
          className="relative max-w-5xl mx-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
            {/* Left column: oversized quote mark */}
            <div className="hidden md:flex md:col-span-2 justify-end pt-2">
              <Quote
                className="w-16 h-16 text-primary-300/40"
                strokeWidth={1}
              />
            </div>

            {/* Right column: quote content */}
            <div className="md:col-span-10 min-h-[280px] md:min-h-[240px] relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* The quote itself -- large, confident, no quotes wrapper needed */}
                  <blockquote className="text-xl md:text-2xl lg:text-[1.75rem] text-secondary-700 leading-relaxed md:leading-[1.6] font-light tracking-[-0.01em] mb-10">
                    &ldquo;{getLocalizedField(t.quote, locale)}&rdquo;
                  </blockquote>

                  {/* Attribution -- separated by a small accent bar */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-px bg-accent-400" />
                    <div>
                      <p className="text-sm font-semibold text-secondary-800 tracking-wide">
                        {t.authorName}
                      </p>
                      <p className="text-sm text-secondary-500 mt-0.5">
                        {getLocalizedField(t.authorTitle, locale)}
                        {t.companyName && (
                          <span className="text-secondary-400">
                            {' '}&mdash; {t.companyName}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom controls */}
          {total > 1 && (
            <div className="mt-14 md:mt-16 max-w-5xl mx-auto">
              <div className="flex items-center gap-6">
                {/* Navigation arrows -- minimal, inline */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrev}
                    className="group w-10 h-10 flex items-center justify-center border border-secondary-200 rounded-full transition-all duration-300 hover:border-secondary-400 hover:bg-secondary-50"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-4 h-4 text-secondary-400 group-hover:text-secondary-700 transition-colors" />
                  </button>
                  <button
                    onClick={goNext}
                    className="group w-10 h-10 flex items-center justify-center border border-secondary-200 rounded-full transition-all duration-300 hover:border-secondary-400 hover:bg-secondary-50"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-4 h-4 text-secondary-400 group-hover:text-secondary-700 transition-colors" />
                  </button>
                </div>

                {/* Progress segments -- one per testimonial */}
                <div className="flex-1 flex items-center gap-1.5">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goTo(index)}
                      className="relative flex-1 h-[2px] bg-secondary-200 overflow-hidden cursor-pointer group"
                      aria-label={`Go to testimonial ${index + 1}`}
                    >
                      {/* Hover highlight */}
                      <span className="absolute inset-0 bg-secondary-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {/* Active fill or progress bar */}
                      {index < current && (
                        <span className="absolute inset-0 bg-secondary-400" />
                      )}
                      {index === current && (
                        <motion.span
                          className="absolute inset-y-0 left-0 bg-accent-400"
                          style={{ width: `${progress}%` }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
