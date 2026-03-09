'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { HeroSection as HeroSectionType } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Button from '@/components/ui/Button'
import BlurText from '@/components/reactbits/BlurText'
import CircularText from '@/components/reactbits/CircularText'
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

  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

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
    >
      {/* Background image with parallax */}
      {section.backgroundImageUrl ? (
        <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
          <Image
            src={section.backgroundImageUrl}
            alt=""
            fill
            className="object-cover"
            priority
            quality={85}
          />
          {/* Dark overlay with gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(30,42,56,0.88) 0%, rgba(15,52,96,0.82) 100%)',
            }}
          />
        </motion.div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-secondary-800) 0%, var(--color-primary-900) 100%)',
          }}
        />
      )}

      {/* Animated floating circles */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, var(--color-primary-400), transparent)',
          y: yParallax,
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, var(--color-primary-300), transparent)',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, var(--color-accent-400), transparent)',
        }}
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="container-padding relative z-10 py-32 text-center"
        style={{ opacity }}
      >
        <BlurText
          text={heading || ''}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight justify-center"
          delay={80}
          animateBy="words"
          direction="top"
          stepDuration={0.4}
        />

        {section.bulletPoints && section.bulletPoints.length > 0 && (
          <div className="h-16 mb-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentBullet}
                className="text-xl md:text-2xl max-w-2xl mx-auto"
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
          className="flex flex-col sm:flex-row gap-4 justify-center"
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

        {/* NIS2 & DORA READY spinning badge */}
        <motion.div
          className="absolute bottom-8 right-8 md:bottom-16 md:right-16 w-[120px] h-[120px] md:w-[140px] md:h-[140px]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.5, type: 'spring' }}
        >
          <div className="relative w-full h-full">
            {/* Center shield icon */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div
                className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/25"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            {/* Spinning text */}
            <CircularText
              text="NIS2 & DORA READY * COMPLIANT * "
              spinDuration={18}
              onHover="speedUp"
              className="text-white"
              radius={40}
              fontSize={11}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
