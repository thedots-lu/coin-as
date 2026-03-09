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
  const touchStartX = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = testimonials.length

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % total)
    }, 8000)
  }, [total])

  useEffect(() => {
    if (total <= 1) return
    startAutoPlay()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
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

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <section className="py-20 bg-secondary-50">
      <div className="container-padding">
        {headingText && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {headingText}
          </h2>
        )}

        <div
          className="relative max-w-3xl mx-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation arrows */}
          {total > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-2 rounded-full bg-white shadow-md hover:bg-primary-50 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-secondary-700" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-2 rounded-full bg-white shadow-md hover:bg-primary-50 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-secondary-700" />
              </button>
            </>
          )}

          {/* Carousel content */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="glass-card p-8 md:p-12 text-center"
              >
                <Quote className="w-10 h-10 text-primary-300 mx-auto mb-6" />
                <blockquote className="text-lg md:text-xl text-gray-700 mb-6 italic leading-relaxed">
                  &ldquo;{getLocalizedField(testimonials[current].quote, locale)}&rdquo;
                </blockquote>
                <div>
                  <p className="font-semibold text-secondary-800">
                    {testimonials[current].authorName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getLocalizedField(testimonials[current].authorTitle, locale)}
                    {testimonials[current].companyName && (
                      <> &mdash; {testimonials[current].companyName}</>
                    )}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          {total > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === current
                      ? 'bg-primary-500 w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
