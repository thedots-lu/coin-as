'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getLocalizedField } from '@/lib/locale'
import { ServicePillarsSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Link from 'next/link'
import { BookOpen, Building2, ShieldCheck, Lightbulb, ArrowRight } from 'lucide-react'
import BlurText from '@/components/reactbits/BlurText'

const pillarConfig = [
  {
    Icon: BookOpen,
    accentColor: 'var(--color-primary-500)',
    accentColorRgb: '14, 158, 239',
    glowPosition: '15% 15%',
    number: '01',
  },
  {
    Icon: Building2,
    accentColor: 'var(--color-accent-400)',
    accentColorRgb: '251, 191, 36',
    glowPosition: '85% 15%',
    number: '02',
  },
  {
    Icon: ShieldCheck,
    accentColor: 'var(--color-primary-300)',
    accentColorRgb: '125, 205, 253',
    glowPosition: '15% 85%',
    number: '03',
  },
  {
    Icon: Lightbulb,
    accentColor: '#e05d2a',
    accentColorRgb: '224, 93, 42',
    glowPosition: '85% 85%',
    number: '04',
  },
]

interface ServicePillarsProps {
  section: ServicePillarsSection
  locale: Locale
}

function PillarCard({
  pillar,
  config,
  locale,
  ctaText,
}: {
  pillar: ServicePillarsSection['pillars'][0]
  config: (typeof pillarConfig)[0]
  locale: Locale
  ctaText: string
  index: number
}) {
  const [isHovered, setIsHovered] = useState(false)
  const title = getLocalizedField(pillar.title, locale)
  const description = getLocalizedField(pillar.description, locale)
  const tagline = getLocalizedField(pillar.tagline, locale)
  const { Icon, accentColor, accentColorRgb, glowPosition, number } = config

  const card = (
    <motion.div
      className="relative h-[430px] overflow-hidden cursor-pointer rounded-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* --- Card base: dark fill --- */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--color-surface-dark)' }}
      />

      {/* --- Dot grid pattern --- */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)`,
          backgroundSize: '18px 18px',
        }}
      />

      {/* --- Radial glow spot --- */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isHovered ? 0.25 : 0.14 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          background: `radial-gradient(ellipse 55% 55% at ${glowPosition}, rgba(${accentColorRgb}, 1) 0%, transparent 70%)`,
        }}
      />

      {/* --- Accent top edge line --- */}
      <div
        className="absolute top-0 left-6 right-6 h-[2px] rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      {/* --- Accent left edge --- */}
      <motion.div
        className="absolute left-0 top-0 w-[3px] z-10 rounded-r-full"
        style={{ background: accentColor }}
        animate={{
          height: isHovered ? '100%' : '35%',
          opacity: isHovered ? 0.9 : 0.4,
        }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      />

      {/* --- Content --- */}
      <div className="relative z-10 h-full flex flex-col p-7">
        {/* Top row: number + icon */}
        <div className="flex items-start justify-between mb-auto">
          <span
            className="text-[11px] font-semibold tracking-[0.3em] uppercase"
            style={{ color: accentColor }}
          >
            {number}
          </span>

          {/* Icon as visual hero with glow ring */}
          <motion.div
            className="relative"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Glow ring behind icon */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{ opacity: isHovered ? 0.5 : 0.2 }}
              transition={{ duration: 0.5 }}
              style={{
                boxShadow: `0 0 24px 6px rgba(${accentColorRgb}, 0.35)`,
              }}
            />
            <div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `rgba(${accentColorRgb}, 0.1)`,
                border: `1px solid rgba(${accentColorRgb}, 0.25)`,
              }}
            >
              <Icon
                className="w-7 h-7"
                style={{ color: accentColor }}
              />
            </div>
          </motion.div>
        </div>

        {/* Bottom content block */}
        <div>
          {/* Title */}
          <motion.div
            animate={{ y: isHovered ? -6 : 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <h3 className="text-[26px] font-bold text-white leading-tight mb-3 font-display tracking-tight">
              {title}
            </h3>

            {/* Accent underline */}
            <motion.div
              className="h-[2px] rounded-full mb-4"
              style={{ background: accentColor }}
              animate={{ width: isHovered ? '4rem' : '2rem' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            />
          </motion.div>

          {/* Tagline / Description swap */}
          <div className="min-h-[80px]">
            <AnimatePresence mode="wait">
              {!isHovered ? (
                <motion.p
                  key="tagline"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-[17px] font-light italic leading-relaxed text-white/60"
                >
                  {tagline}
                </motion.p>
              ) : (
                <motion.p
                  key="description"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-[14px] leading-relaxed text-white/80"
                >
                  {description}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <motion.div
            className="flex items-center gap-3 mt-5 pt-4 border-t border-white/8"
            animate={{ opacity: isHovered ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/90"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              {ctaText}
            </motion.span>
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300"
              style={{
                background: isHovered
                  ? `rgba(${accentColorRgb}, 0.9)`
                  : 'rgba(255,255,255,0.08)',
              }}
              animate={{
                x: isHovered ? 6 : 0,
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )

  return pillar.link ? (
    <Link href={pillar.link} className="block h-full">{card}</Link>
  ) : (
    card
  )
}

export default function ServicePillars({ section, locale }: ServicePillarsProps) {
  const heading = getLocalizedField(section.heading, locale)
  const subtitle = getLocalizedField(section.subtitle, locale)
  const ctaText = getLocalizedField(section.ctaText, locale) || 'Discover our solutions'

  return (
    <section className="relative py-28 bg-warm-50 overflow-hidden">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-secondary-400) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative container-padding">
        {/* Section header */}
        <AnimatedSection animation="slideUp" className="mb-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Overline */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-accent-400 rounded-full" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-secondary-400 font-display">
                What we do
              </span>
              <div className="w-8 h-[2px] bg-accent-400 rounded-full" />
            </div>

            <BlurText
              text={heading || ''}
              className="text-3xl md:text-[42px] font-bold text-secondary-800 mb-5 justify-center leading-tight tracking-tight"
              delay={100}
              animateBy="words"
              direction="top"
            />
            {subtitle && (
              <p className="text-lg text-secondary-400 max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </AnimatedSection>

        {/* Pillar cards — 2×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-7 max-w-4xl mx-auto">
          {section.pillars.map((pillar, index) => (
            <AnimatedSection
              key={index}
              animation="slideUp"
              delay={index * 0.12}
            >
              <PillarCard
                pillar={pillar}
                config={pillarConfig[index % pillarConfig.length]}
                locale={locale}
                ctaText={ctaText}
                index={index}
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
