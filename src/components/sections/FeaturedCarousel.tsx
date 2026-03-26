'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import type { FeaturedCarouselSection } from '@/lib/types/page'
import type { Locale } from '@/lib/types/locale'

interface FeaturedCarouselProps {
  section: FeaturedCarouselSection
  locale: Locale
}

const AUTO_PLAY_MS = 6000

export default function FeaturedCarousel({ section, locale }: FeaturedCarouselProps) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const items = section.items ?? []

  const heading = getLocalizedField(section.heading, locale)
  const subtitle = getLocalizedField(section.subtitle, locale)

  const next = useCallback(() => {
    setActive((i) => (i + 1) % items.length)
  }, [items.length])

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + items.length) % items.length)
  }, [items.length])

  useEffect(() => {
    if (paused || items.length <= 1) return
    const timer = setInterval(next, AUTO_PLAY_MS)
    return () => clearInterval(timer)
  }, [paused, next, items.length])

  if (items.length === 0) return null

  const current = items[active]

  return (
    <section className="py-16 bg-white">
      <div className="container-padding">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{heading}</h2>
          {subtitle && <p className="text-slate-500 max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        {/* Carousel */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-2 min-h-[360px]"
            >
              {/* Image */}
              <div className="relative min-h-[240px] md:min-h-[360px]">
                {current.imageUrl ? (
                  <Image
                    src={current.imageUrl}
                    alt={getLocalizedField(current.title, locale)}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 md:to-transparent" />
              </div>

              {/* Content */}
              <div className="bg-primary-950 text-white p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent-400 mb-4 px-3 py-1 rounded-full border border-accent-500/30 w-fit">
                  {getLocalizedField(current.label, locale)}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                  {getLocalizedField(current.title, locale)}
                </h3>
                <p className="text-primary-200 leading-relaxed mb-8">
                  {getLocalizedField(current.description, locale)}
                </p>
                <Link
                  href={current.linkHref}
                  className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors w-fit"
                >
                  {getLocalizedField(current.linkText, locale)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev/Next arrows */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full p-2 transition-all z-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full p-2 transition-all z-10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Dots + progress */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className={`relative h-2 rounded-full transition-all duration-300 overflow-hidden ${
                  i === active ? 'w-8 bg-primary-200' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              >
                {i === active && !paused && (
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: AUTO_PLAY_MS / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Item tabs (desktop) */}
        <div className="hidden md:grid grid-cols-3 gap-4 mt-8">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                i === active
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-transparent bg-slate-50 hover:border-slate-200'
              }`}
            >
              <span className="block text-xs font-bold uppercase tracking-wider text-accent-500 mb-1">
                {getLocalizedField(item.label, locale)}
              </span>
              <span className={`font-semibold text-sm ${i === active ? 'text-primary-600' : 'text-slate-600'}`}>
                {getLocalizedField(item.title, locale)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
