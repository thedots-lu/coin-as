'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { getLocalizedField } from '@/lib/locale'
import { HeroSection as HeroSectionType } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Button from '@/components/ui/Button'
import BlurText from '@/components/reactbits/BlurText'
import CircularText from '@/components/reactbits/CircularText'
import FloatingLines from '@/components/reactbits/FloatingLines'
import { ShieldCheck } from 'lucide-react'

interface HeroSectionProps {
  section: HeroSectionType
  locale: Locale
}

export default function HeroSection({ section, locale }: HeroSectionProps) {
  const [currentBullet, setCurrentBullet] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    if (!section.bulletPoints || section.bulletPoints.length <= 1) return

    const interval = setInterval(() => {
      setCurrentBullet((prev) => (prev + 1) % section.bulletPoints.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [section.bulletPoints])

  const heading = getLocalizedField(section.heading, locale)
  const primaryBtnText = getLocalizedField(section.primaryButtonText, locale)
  const secondaryBtnText = getLocalizedField(section.secondaryButtonText, locale)

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--color-surface-darkest) 0%, var(--color-surface-dark) 50%, var(--color-surface-darkest) 100%)' }}
    >
      {/* FloatingLines overlay */}
      <div className="absolute inset-0 z-0">
        <FloatingLines
          linesGradient={['#1e90ff', '#00bfff', '#4169e1', '#87ceeb']}
          lineCount={4}
          lineDistance={4}
          bendRadius={3}
          bendStrength={-0.3}
          animationSpeed={0.8}
          mixBlendMode="screen"
        />
      </div>

      <motion.div
        className="container-padding relative z-10 py-32 text-left"
        style={{ opacity }}
      >
        <div className="max-w-3xl">
          <BlurText
            text={heading || ''}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight"
            delay={80}
            animateBy="words"
            direction="top"
            stepDuration={0.4}
          />

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

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
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

        {/* NIS2 & DORA READY spinning badge */}
        <motion.div
          className="absolute bottom-12 right-8 md:bottom-12 md:right-12 w-[100px] h-[100px] md:w-[120px] md:h-[120px]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.5, type: 'spring' }}
        >
          <div className="relative w-full h-full">
            {/* Center shield icon */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div
                className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-sm border border-accent-400/30"
                style={{ background: 'rgba(251,191,36,0.1)' }}
              >
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-accent-400" />
              </div>
            </div>
            {/* Spinning text */}
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
