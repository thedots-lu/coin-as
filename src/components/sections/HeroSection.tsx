'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { HeroSection as HeroSectionType } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Button from '@/components/ui/Button'
import CircularText from '@/components/reactbits/CircularText'

// ---------------------------------------------------------------------------
// Carousel slides — each has its own image, label, title, description
// ---------------------------------------------------------------------------
const SLIDES = [
  {
    src: '/images/coin/co-location-area-munsbach.webp',
    alt: 'COIN AS co-location server room',
    label: 'Data Centres',
    title: 'Secure Co-location & Data Centres',
    description: 'State-of-the-art facilities across BeNeLux with redundant power, cooling and connectivity.',
  },
  {
    src: '/images/coin/coin-luxembourg-contern-recovery-office-small-2.webp',
    alt: 'COIN AS recovery workplaces at Contern',
    label: 'Recovery Workplaces',
    title: '750+ Recovery Workplaces',
    description: 'Fully equipped offices ready for immediate activation when disaster strikes.',
  },
  {
    src: '/images/coin/coin-luxembourg-common-area-2.webp',
    alt: 'COIN AS secure server corridor',
    label: 'Cyber Resilience',
    title: 'Cyber Resilience & IT Recovery',
    description: 'Comprehensive IT disaster recovery and cyber resilience solutions for your critical systems.',
  },
  {
    src: '/images/coin/coin-fotosharonwillems-26.webp',
    alt: 'COIN AS team presenting a Business Continuity Plan',
    label: 'Business Continuity',
    title: 'BCP Consulting & Training',
    description: 'Expert consulting to build, test and maintain your Business Continuity Plans. NIS2 & DORA ready.',
  },
]

const INTERVAL = 6000

interface HeroSectionProps {
  section: HeroSectionType
  locale: Locale
}

export default function HeroSection({ section, locale }: HeroSectionProps) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setActive((i) => (i + 1) % SLIDES.length), [])
  const prev = useCallback(() => setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (paused || SLIDES.length <= 1) return
    const timer = setInterval(next, INTERVAL)
    return () => clearInterval(timer)
  }, [paused, next])

  const heading = getLocalizedField(section.heading, locale)
  const primaryBtnText = getLocalizedField(section.primaryButtonText, locale)
  const secondaryBtnText = getLocalizedField(section.secondaryButtonText, locale)
  const current = SLIDES[active]

  return (
    <section className="pt-4 pb-8 bg-white">
      <div className="container-padding">
        {/* Main carousel card */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-2 md:h-[480px]"
            >
              {/* Left — Image */}
              <div className="relative min-h-[280px] md:min-h-[460px]">
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  priority={active === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />
              </div>

              {/* Right — Content panel */}
              <div className="bg-primary-950 text-white p-8 md:p-12 lg:p-14 flex flex-col justify-center">
                {/* Slide label */}
                <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-accent-400 mb-5 px-3 py-1 rounded-full border border-accent-500/30 w-fit">
                  {current.label}
                </span>

                {/* Main heading (from Firestore) on first slide, slide title on others */}
                <h1 className="text-2xl md:text-3xl lg:text-[2.2rem] font-bold mb-4 leading-[1.15] tracking-tight font-display">
                  {active === 0 && heading ? heading : current.title}
                </h1>

                {/* Description */}
                <p className="text-primary-200 leading-relaxed mb-8 text-base md:text-lg max-w-lg">
                  {current.description}
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {primaryBtnText && (
                    <Button
                      href={section.primaryButtonLink}
                      variant="primary"
                      className="text-base px-7 py-3.5 !bg-accent-500 hover:!bg-accent-600 !shadow-accent-500/25"
                    >
                      {primaryBtnText}
                    </Button>
                  )}
                  {secondaryBtnText && (
                    <Button
                      href={section.secondaryButtonLink}
                      variant="outline"
                      className="text-base px-7 py-3.5 border-white/30 text-white hover:bg-white hover:text-primary-800"
                    >
                      {secondaryBtnText}
                    </Button>
                  )}
                </div>

                {/* NIS2/DORA badge — hidden for now, keep for later
                <div className="lg:flex justify-end mt-6">
                  <div className="w-[110px] h-[110px]">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                          <img
                            src="/images/coin/coin-sigle.svg"
                            alt="COIN AS"
                            className="w-9 h-9"
                          />
                        </div>
                      </div>
                      <CircularText
                        text="NIS2 & DORA READY * COMPLIANT * "
                        spinDuration={18}
                        onHover="speedUp"
                        className="text-white/60"
                        radius={34}
                        fontSize={9}
                      />
                    </div>
                  </div>
                </div>
                end hidden NIS2/DORA badge */}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev/Next arrows */}
          {SLIDES.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white rounded-full p-2 transition-all z-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white rounded-full p-2 transition-all z-10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Dots progress */}
        {SLIDES.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className={`relative h-2 rounded-full transition-all duration-300 overflow-hidden ${
                  i === active ? 'w-8 bg-primary-200' : 'w-2 bg-secondary-300 hover:bg-secondary-400'
                }`}
              >
                {i === active && !paused && (
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Tab cards (desktop) */}
        <div className="hidden md:grid grid-cols-4 gap-4 mt-6">
          {SLIDES.map((slide, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                i === active
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-transparent bg-secondary-50 hover:border-secondary-200'
              }`}
            >
              <span className="block text-xs font-bold uppercase tracking-wider text-accent-600 mb-1">
                {slide.label}
              </span>
              <span className={`font-semibold text-sm ${i === active ? 'text-primary-600' : 'text-secondary-600'}`}>
                {slide.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
