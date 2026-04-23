'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
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
    src: '/images/coin/coin-fotosharonwillems-60.webp',
    alt: 'COIN AS team collaborating on business continuity',
    label: '20 Years of Innovation',
    title: '20 years of Business Continuity innovation. BeNeLux market leader.',
    bullets: null,
    description: "With over 20 years of experience in business continuity, COIN continuously develops innovative solutions to help organisations stay resilient in an increasingly complex business and regulatory environment.",
  },
  {
    src: '/images/coin/coin-luxembourg-contern-disaster-recovery-office-big.webp',
    alt: 'COIN AS dedicated recovery site at Contern',
    label: 'Dedicated Site',
    title: 'Outsource the operation of your site to COIN',
    bullets: [
      'You use your second office or COIN rents a dedicated site for you',
      'You decide how it is designed and if it is also used as satellite office',
      'We ensure site and procedures are documented and tested',
      'We operate and maintain the site and assist in case of disaster, 24x7',
    ],
    description: null,
    secondaryCta: {
      text: 'Read our article',
      href: '/knowledge-hub',
    },
  },
  {
    src: '/images/coin/coin-fotosharonwillems-16.webp',
    alt: 'COIN AS recovery workplaces during a business continuity exercise',
    label: 'Testing & Exercises',
    title: 'Test your business continuity plan with COIN',
    bullets: [
      'COIN experts help you prepare and organise your exercise',
      'Our business continuity centres host 100+ exercises every year',
      'Use COIN recovery office facilities and crisis management rooms',
      'Service also available for organisations with their own disaster site',
      'Insightful learnings and better preparation for real disasters',
    ],
    description: null,
  },
  // Hidden for now — kept for later re-enable
  // {
  //   src: '/images/coin/coin-fotosharonwillems-36.webp',
  //   alt: 'COIN AS experts analyzing DORA compliance requirements',
  //   label: 'NIS2 & DORA',
  //   title: 'Is your organisation ready for NIS2 and DORA?',
  //   bullets: [
  //     'Free readiness assessment of your digital operational resilience',
  //     'Personalised compliance roadmap and priority actions',
  //     'Expert review of your ICT risk management and incident response',
  //   ],
  //   description: null,
  // },
]

const INTERVAL = 12000

interface HeroSectionProps {
  section: HeroSectionType
  locale: Locale
}

export default function HeroSection({ section, locale }: HeroSectionProps) {
  const [active, setActive] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [manualPaused, setManualPaused] = useState(false)
  const paused = hoverPaused || manualPaused

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
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
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

                {/* Slide title */}
                <h1 className="text-2xl md:text-3xl lg:text-[2.2rem] font-bold mb-4 leading-[1.15] tracking-tight font-display">
                  {current.title}
                </h1>

                {/* Content: bullets or description paragraph */}
                {current.bullets ? (
                  <ul className="text-primary-200 mb-6 text-[13px] md:text-sm max-w-lg space-y-1.5">
                    {current.bullets.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 leading-snug">
                        <span className="shrink-0 mt-[7px] w-1 h-1 rounded-full bg-accent-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : current.description ? (
                  <p className="text-primary-200 leading-relaxed mb-6 text-sm md:text-base max-w-lg">
                    {current.description}
                  </p>
                ) : null}

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
                  {(() => {
                    const slideCta = 'secondaryCta' in current ? current.secondaryCta : null
                    const text = slideCta?.text ?? secondaryBtnText
                    const href = slideCta?.href ?? section.secondaryButtonLink
                    return text ? (
                      <Button
                        href={href}
                        variant="outline"
                        className="text-base px-7 py-3.5 border-white/30 text-white hover:shadow-lg hover:shadow-white/10 hover:border-white/60"
                      >
                        {text}
                      </Button>
                    ) : null
                  })()}
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

        {/* Dots progress + play/pause */}
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
            <button
              type="button"
              onClick={() => setManualPaused((p) => !p)}
              aria-label={manualPaused ? 'Play carousel' : 'Pause carousel'}
              aria-pressed={manualPaused}
              className="ml-2 flex items-center justify-center h-7 w-7 rounded-full text-primary-700 hover:bg-secondary-200 transition-colors"
            >
              {manualPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
