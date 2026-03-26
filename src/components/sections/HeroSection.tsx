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
import { ShieldCheck, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

// ---------------------------------------------------------------------------
// Carousel slides — technology, resilience, data centres, recovery workspaces
// ---------------------------------------------------------------------------
const SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80',
    alt: 'Data centre server room with blue LED lighting',
    label: 'Data Centres',
  },
  {
    src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    alt: 'Modern disaster recovery workspace with multiple workstations',
    label: 'Recovery Workplaces',
  },
  {
    src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
    alt: 'Cybersecurity and network resilience concept',
    label: 'Cyber Resilience',
  },
  {
    src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
    alt: 'Global digital infrastructure and connectivity',
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

  // Auto-advance carousel
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(next, INTERVAL)
  }, [next])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  // Rotating bullet points
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
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Background image carousel                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
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

        {/* Gradient overlay — strong left for readability, fades right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(4,10,20,0.92) 0%, rgba(4,10,20,0.78) 40%, rgba(4,10,20,0.45) 70%, rgba(4,10,20,0.25) 100%)',
          }}
        />
        {/* Bottom vignette */}
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{ background: 'linear-gradient(to top, rgba(4,10,20,0.6), transparent)' }}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Hero content                                                        */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        className="container-padding relative z-10 py-32 w-full"
        style={{ opacity }}
      >
        <div className="max-w-3xl">
          {/* Heading — word-by-word blur reveal */}
          <BlurText
            text={heading || ''}
            delay={120}
            animateBy="words"
            direction="bottom"
            stepDuration={0.45}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight"
          />

          {/* Rotating bullet points */}
          {section.bulletPoints && section.bulletPoints.length > 0 && (
            <div className="h-16 mb-10 flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentBullet}
                  className="text-xl md:text-2xl max-w-2xl"
                  style={{ color: 'rgba(186, 210, 255, 0.9)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {getLocalizedField(section.bulletPoints[currentBullet], locale)}
                </motion.p>
              </AnimatePresence>
            </div>
          )}

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {primaryBtnText && (
              <Button href={section.primaryButtonLink} variant="primary" className="text-lg px-8 py-4">
                {primaryBtnText}
              </Button>
            )}
            {secondaryBtnText && (
              <Button href={section.secondaryButtonLink} variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-secondary-800">
                {secondaryBtnText}
              </Button>
            )}
          </motion.div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Carousel controls — bottom                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
          {/* Prev */}
          <button
            type="button"
            onClick={() => { prev(); resetTimer() }}
            aria-label="Previous slide"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {SLIDES.map((slide, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setCurrent(i); resetTimer() }}
                aria-label={slide.label}
                className="relative flex items-center justify-center"
              >
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 28 : 8,
                    height: 8,
                    backgroundColor: i === current ? 'var(--color-accent-500)' : 'rgba(255,255,255,0.35)',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => { next(); resetTimer() }}
            aria-label="Next slide"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Slide label — bottom right */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`label-${current}`}
            className="absolute bottom-8 right-8 md:right-12 hidden md:flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4 }}
          >
            <span className="w-4 h-[2px] bg-accent-500 rounded-full" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              {SLIDES[current].label}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Scroll down indicator */}
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 cursor-pointer select-none"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          aria-label="Scroll down"
          role="button"
          tabIndex={0}
        >
          <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-white/50">
            Scroll
          </span>
          <ChevronDown className="w-5 h-5 text-white/50 animate-bounce" />
        </div>

        {/* NIS2 & DORA READY spinning badge */}
        <motion.div
          className="absolute bottom-20 right-8 md:bottom-16 md:right-12 w-[100px] h-[100px] md:w-[120px] md:h-[120px]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2, type: 'spring' }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div
                className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-sm border border-accent-400/30"
                style={{ background: 'rgba(251,191,36,0.1)' }}
              >
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-accent-400" />
              </div>
            </div>
            <CircularText
              text="NIS2 & DORA READY * COMPLIANT * "
              spinDuration={18}
              onHover="speedUp"
              className="text-white"
              radius={34}
              fontSize={10}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
