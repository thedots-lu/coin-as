'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { ServicePillarsSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Link from 'next/link'
import { BookOpen, Building2, ShieldCheck, ArrowRight } from 'lucide-react'
import BlurText from '@/components/reactbits/BlurText'

const pillarConfig = [
  {
    Icon: BookOpen,
    gradientStyle: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%)',
  },
  {
    Icon: Building2,
    gradientStyle: 'linear-gradient(135deg, var(--color-secondary-600) 0%, var(--color-secondary-800) 100%)',
  },
  {
    Icon: ShieldCheck,
    gradientStyle: 'linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-secondary-700) 100%)',
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
}) {
  const [isHovered, setIsHovered] = useState(false)
  const title = getLocalizedField(pillar.title, locale)
  const description = getLocalizedField(pillar.description, locale)
  const tagline = getLocalizedField(pillar.tagline, locale)
  const { Icon, gradientStyle } = config

  const card = (
    <motion.div
      className="relative h-[420px] rounded-2xl overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Background image */}
      {pillar.imageUrl ? (
        <>
          <Image
            src={pillar.imageUrl}
            alt={title || ''}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {/* Gradient overlay on image */}
          <div className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.5) 100%)',
            }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: gradientStyle }} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8">
        {/* Top: Icon + Tagline */}
        <div>
          <motion.div
            className="w-14 h-14 rounded-xl backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>

          <h3 className="text-2xl font-bold text-white mb-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{title}</h3>

          <AnimatePresence mode="wait">
            {!isHovered ? (
              <motion.p
                key="tagline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="text-xl font-light italic"
                style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
              >
                {tagline}
              </motion.p>
            ) : (
              <motion.p
                key="description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="text-[15px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
              >
                {description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom: CTA */}
        <motion.div
          className="flex items-center gap-2 text-white font-semibold text-sm"
          animate={{ x: isHovered ? 4 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span>{ctaText}</span>
          <motion.span
            animate={{ x: isHovered ? 6 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.span>
        </motion.div>
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
    <section className="py-24 bg-white">
      <div className="container-padding">
        <AnimatedSection animation="slideUp" className="text-center mb-16">
          <BlurText
            text={heading || ''}
            className="text-3xl md:text-4xl font-bold text-secondary-800 mb-4 justify-center"
            delay={100}
            animateBy="words"
            direction="top"
          />
          {subtitle && (
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
          )}
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {section.pillars.map((pillar, index) => (
            <AnimatedSection key={index} animation="slideUp" delay={index * 0.2}>
              <PillarCard
                pillar={pillar}
                config={pillarConfig[index % pillarConfig.length]}
                locale={locale}
                ctaText={ctaText}
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
