'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { HeroSection as HeroSectionType } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Button from '@/components/ui/Button'
import CircularText from '@/components/reactbits/CircularText'
import BlurText from '@/components/reactbits/BlurText'
import { ChevronDown } from 'lucide-react'

// ---------------------------------------------------------------------------
// Carousel slides
// ---------------------------------------------------------------------------
const SLIDES = [
  {
    src: '/images/coin/co-location-area-munsbach.webp',
    alt: 'COIN AS co-location server room in Münsbach with blue LED lighting',
    label: 'Data Centres',
  },
  {
    src: '/images/coin/coin-luxembourg-contern-recovery-office-small-2.webp',
    alt: 'COIN AS recovery workplaces at Contern with staff operating at workstations',
    label: 'Recovery Workplaces',
  },
  {
    src: '/images/coin/coin-luxembourg-common-area-2.webp',
    alt: 'COIN AS secure server corridor with resilient infrastructure',
    label: 'Cyber Resilience',
  },
  {
    src: '/images/coin/coin-fotosharonwillems-26.webp',
    alt: 'COIN AS team presenting a Business Continuity Plan in meeting room',
    label: 'Business Continuity',
  },
]

const INTERVAL = 5500

interface HeroSectionProps {
  section: HeroSectionType
  locale: Locale
}

export default function HeroSection({ section, locale }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)
  const [currentBullet, setCurrentBullet] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const next = useCallback(() => setCurrent((p) => (p + 1) % SLIDES.length), [])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length), [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(next, INTERVAL)
  }, [next])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  useEffect(() => {
    if (!section.bulletPoints || section.bulletPoints.length <= 1) return
    const id = setInterval(() => {
      setCurrentBullet((p) => (p + 1) % section.bulletPoints.length)
    }, 3500)
    return () => clearInterval(id)
  }, [section.bulletPoints])

  const heading = getLocalizedField(section.heading, locale)
  const primaryBtnText = getLocalizedField(section.primaryButtonText, locale)
  const secondaryBtnText = getLocalizedField(section.secondaryButtonText, locale)

  return (
    <section
      ref={containerRef}
      className="relative h-[85vh] min-h-[600px] max-h-[900px] flex items-center overflow-hidden"
    >
      {/* Background carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            <Image
              src={SLIDES[current].src}
              alt={SLIDES[current].alt}
              fill
              priority={current === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay — navy gradient from left */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, rgba(0,71,121,0.92) 0%, rgba(0,71,121,0.75) 35%, rgba(0,40,70,0.50) 60%, rgba(0,30,55,0.35) 100%)',
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{ background: 'linear-gradient(to top, rgba(0,40,70,0.7), transparent)' }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="container-padding relative z-10 w-full"
        style={{ opacity }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left — text content */}
          <div className="lg:col-span-8 xl:col-span-7">
            {/* Overline */}
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-10 h-[2px] bg-accent-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">
                Business Continuity & Cyber Resilience
              </span>
            </motion.div>

            {/* Heading — BlurText animation */}
            <BlurText
              text={heading || ''}
              delay={120}
              animateBy="words"
              direction="bottom"
              stepDuration={0.45}
              className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-white mb-6 leading-[1.15] tracking-tight"
            />

            {/* Rotating bullet points */}
            {section.bulletPoints && section.bulletPoints.length > 0 && (
              <div className="h-14 mb-8 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentBullet}
                    className="text-lg md:text-xl max-w-xl leading-relaxed text-white/80"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.45 }}
                  >
                    {getLocalizedField(section.bulletPoints[currentBullet], locale)}
                  </motion.p>
                </AnimatePresence>
              </div>
            )}

            {/* CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              {primaryBtnText && (
                <Button href={section.primaryButtonLink} variant="primary" className="text-base px-7 py-3.5 !bg-accent-500 hover:!bg-accent-600 !shadow-accent-500/25">
                  {primaryBtnText}
                </Button>
              )}
              {secondaryBtnText && (
                <Button href={section.secondaryButtonLink} variant="outline" className="text-base px-7 py-3.5 border-white/40 text-white hover:bg-white hover:text-primary-800">
                  {secondaryBtnText}
                </Button>
              )}
            </motion.div>
          </div>

          {/* Right — NIS2/DORA badge */}
          <div className="hidden lg:flex lg:col-span-4 xl:col-span-5 justify-end items-center">
            <motion.div
              className="w-[140px] h-[140px]"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2, type: 'spring' }}
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                    <img
                      src="/images/coin/coin-sigle.svg"
                      alt="COIN AS"
                      className="w-12 h-12"
                    />
                  </div>
                </div>
                <CircularText
                  text="NIS2 & DORA READY * COMPLIANT * "
                  spinDuration={18}
                  onHover="speedUp"
                  className="text-white"
                  radius={42}
                  fontSize={11}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom bar — carousel controls + slide info */}
      <div className="absolute bottom-0 inset-x-0 z-20">
        <div className="container-padding py-5 flex items-center justify-between">
          {/* Slide label */}
          <AnimatePresence mode="wait">
            <motion.span
              key={`label-${current}`}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50 hidden sm:block"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {SLIDES[current].label}
            </motion.span>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
            {SLIDES.map((slide, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setCurrent(i); resetTimer() }}
                aria-label={slide.label}
              >
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 24 : 6,
                    height: 6,
                    backgroundColor: i === current ? 'var(--color-accent-500)' : 'rgba(255,255,255,0.3)',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Scroll hint */}
          <div
            className="hidden sm:flex items-center gap-1.5 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
            role="button"
            tabIndex={0}
          >
            <span className="text-[10px] font-medium tracking-widest uppercase text-white/40">Scroll</span>
            <ChevronDown className="w-4 h-4 text-white/40 animate-bounce" />
          </div>
        </div>
      </div>

    </section>
  )
}
