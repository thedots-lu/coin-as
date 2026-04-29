'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play, Plus, X } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { HeroSection as HeroSectionType, HeroSlide } from '@/lib/types/page'
import { Locale, LocaleString, ls } from '@/lib/types/locale'
import Button from '@/components/ui/Button'
import EditableText from '@/components/admin/cms/EditableText'
import EditableImage from '@/components/admin/cms/EditableImage'
import { useEditing } from '@/components/admin/cms/EditingContext'

const EMPTY_LS: LocaleString = { en: '', fr: '', nl: '' }

// Default slide content. Used in two scenarios:
//   1. View-mode fallback when section.slides is undefined (pre-initialization)
//   2. Seeded by the drawer's "Initialize slides" button
export const HERO_DEFAULT_SLIDES: HeroSlide[] = [
  {
    imageUrl: '/images/coin/coin-fotosharonwillems-60.webp',
    alt: 'COIN AS team collaborating on business continuity',
    label: ls('20 Years of Innovation'),
    title: ls('20 years of Business Continuity innovation. BeNeLux market leader.'),
    bullets: [],
    description: ls(
      'With over 20 years of experience in business continuity, COIN continuously develops innovative solutions to help organisations stay resilient in an increasingly complex business and regulatory environment.',
    ),
    visible: true,
  },
  {
    imageUrl: '/images/coin/Office-Design-3D-Graphic-3.webp',
    alt: 'COIN AS dedicated recovery office 3D design',
    label: ls('Dedicated Recovery Site'),
    title: ls('Outsource the operation of your own satellite and recovery site'),
    bullets: [
      ls('COIN builds and operates your recovery office, where you want'),
      ls('You decide how it is designed and if it is also used as satellite office'),
      ls('COIN documents procedures tests and exercices'),
      ls('COIN maintains the site and assists in case of disaster, 24x7'),
    ],
    description: { ...EMPTY_LS },
    ctaText: ls('Read our article'),
    ctaLink: '/knowledge-hub',
    visible: true,
  },
  {
    imageUrl: '/images/coin/COIN_Luxembourg_Contern_Disaster_Recovery_Office_Big.webp',
    alt: 'COIN AS dedicated recovery site at Contern',
    label: ls('Testing & Exercises'),
    title: ls('Test your business continuity plan with COIN'),
    bullets: [
      ls('COIN experts help you prepare and organise your exercise'),
      ls('Our business continuity centres host 100+ exercises every year'),
      ls('Use COIN recovery office facilities and crisis management rooms'),
      ls('Service also available for organisations with their own disaster site'),
      ls('Insightful learnings and better preparation for real disasters'),
    ],
    description: { ...EMPTY_LS },
    visible: true,
  },
  {
    imageUrl: '/images/coin/coin-fotosharonwillems-36.webp',
    alt: 'COIN AS experts analyzing DORA compliance requirements',
    label: ls('NIS2 & DORA'),
    title: ls('Is your organisation ready for NIS2 and DORA?'),
    bullets: [
      ls('Free readiness assessment of your digital operational resilience'),
      ls('Personalised compliance roadmap and priority actions'),
      ls('Expert review of your ICT risk management and incident response'),
    ],
    description: { ...EMPTY_LS },
    visible: false,
  },
]

export function makeEmptyHeroSlide(): HeroSlide {
  return {
    imageUrl: null,
    alt: '',
    label: { ...EMPTY_LS },
    title: { ...EMPTY_LS },
    bullets: [],
    description: { ...EMPTY_LS },
    visible: true,
  }
}

const INTERVAL = 12000

interface HeroSectionProps {
  section: HeroSectionType
  locale: Locale
  basePath: string
}

export default function HeroSection({ section, locale, basePath }: HeroSectionProps) {
  const ctx = useEditing()
  const isEditing = !!ctx
  const isFirestoreDriven = Array.isArray(section.slides)
  const sourceSlides = isFirestoreDriven ? (section.slides as HeroSlide[]) : HERO_DEFAULT_SLIDES

  // Pair each slide with its index in section.slides so we can build edit paths.
  const slidesWithIdx = sourceSlides.map((slide, originalIdx) => ({ slide, originalIdx }))
  const visible = slidesWithIdx.filter(({ slide }) => slide.visible !== false)

  const [active, setActive] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [manualPaused, setManualPaused] = useState(false)
  const paused = hoverPaused || manualPaused
  const total = visible.length

  const next = useCallback(() => setActive((i) => (i + 1) % Math.max(1, total)), [total])
  const prev = useCallback(
    () => setActive((i) => (i - 1 + Math.max(1, total)) % Math.max(1, total)),
    [total],
  )

  useEffect(() => {
    if (paused || isEditing || total <= 1) return
    const timer = setInterval(next, INTERVAL)
    return () => clearInterval(timer)
  }, [paused, isEditing, total, next])

  const primaryBtnText = getLocalizedField(section.primaryButtonText, locale)
  const secondaryBtnText = getLocalizedField(section.secondaryButtonText, locale)

  // Empty state (only reachable in edit mode if user hides everything)
  if (total === 0) {
    return (
      <section className="pt-4 pb-8 bg-white">
        <div className="container-padding">
          <div className="rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-600 text-sm">
              {isEditing
                ? 'No visible slides. Open the section settings drawer to add or unhide slides.'
                : 'No slides to display.'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  const activeIdx = Math.min(active, total - 1)
  const { slide: currentSlide, originalIdx: currentOriginalIdx } = visible[activeIdx]
  const slidePath = isFirestoreDriven ? `${basePath}.slides.${currentOriginalIdx}` : null

  // Per-slide CTA override
  const slideCtaText = currentSlide.ctaText ? getLocalizedField(currentSlide.ctaText, locale) : ''
  const slideCtaLink = currentSlide.ctaLink ?? ''
  const slideHasOverride = !!slideCtaText && !!slideCtaLink
  const renderedSecondaryText = slideHasOverride ? slideCtaText : secondaryBtnText
  const renderedSecondaryHref = slideHasOverride ? slideCtaLink : section.secondaryButtonLink
  const showSecondary = !!renderedSecondaryText || isEditing

  // Bullets vs description: bullets take precedence if any. In edit mode with both empty, prefer description editor.
  const hasBullets = currentSlide.bullets.length > 0
  const descText = getLocalizedField(currentSlide.description, locale)
  const showBullets = hasBullets
  const showDescription = !hasBullets && (descText !== '' || isEditing)

  const addBullet = () => {
    if (!ctx || !slidePath) return
    ctx.updateAt(`${slidePath}.bullets`, [...currentSlide.bullets, { ...EMPTY_LS, en: 'New point' }])
  }
  const removeBullet = (idx: number) => {
    if (!ctx || !slidePath) return
    ctx.updateAt(
      `${slidePath}.bullets`,
      currentSlide.bullets.filter((_, i) => i !== idx),
    )
  }
  const convertDescriptionToBullets = () => {
    if (!ctx || !slidePath) return
    ctx.updateAt(`${slidePath}.bullets`, [{ ...EMPTY_LS, en: 'New point' }])
  }

  return (
    <section className="pt-4 pb-8 bg-white">
      <div className="container-padding">
        {isEditing && !isFirestoreDriven && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900">
            Slides are not yet editable. Open the section settings drawer (cog icon, top-right) and
            click <strong>Initialize slides for editing</strong> to import the current content into
            the CMS.
          </div>
        )}

        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentOriginalIdx}-${activeIdx}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-2 md:h-[480px]"
            >
              {/* Left — Image */}
              <div className="relative min-h-[280px] md:min-h-[460px]">
                {slidePath ? (
                  <EditableImage
                    path={`${slidePath}.imageUrl`}
                    src={currentSlide.imageUrl}
                    alt={currentSlide.alt}
                    fill
                    priority={activeIdx === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : currentSlide.imageUrl ? (
                  <Image
                    src={currentSlide.imageUrl}
                    alt={currentSlide.alt}
                    fill
                    priority={activeIdx === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10 pointer-events-none" />
              </div>

              {/* Right — Content panel */}
              <div className="bg-primary-950 text-white p-8 md:p-12 lg:p-14 flex flex-col justify-center">
                {/* Slide label */}
                <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-accent-400 mb-5 px-3 py-1 rounded-full border border-accent-500/30 w-fit max-w-full">
                  {slidePath ? (
                    <EditableText path={`${slidePath}.label`} value={currentSlide.label} as="span" />
                  ) : (
                    getLocalizedField(currentSlide.label, locale)
                  )}
                </span>

                {/* Slide title */}
                <h1 className="text-2xl md:text-3xl lg:text-[2.2rem] font-bold mb-4 leading-[1.15] tracking-tight font-display">
                  {slidePath ? (
                    <EditableText
                      path={`${slidePath}.title`}
                      value={currentSlide.title}
                      as="span"
                      multiline
                    />
                  ) : (
                    getLocalizedField(currentSlide.title, locale)
                  )}
                </h1>

                {/* Bullets or description */}
                {showBullets ? (
                  <ul className="text-primary-200 mb-6 text-[13px] md:text-sm max-w-lg space-y-1.5">
                    {currentSlide.bullets.map((bullet, i) => (
                      <li key={i} className="group/bullet flex items-start gap-2 leading-snug">
                        <span className="shrink-0 mt-[7px] w-1 h-1 rounded-full bg-accent-500" />
                        <span className="flex-1 min-w-0">
                          {slidePath ? (
                            <EditableText
                              path={`${slidePath}.bullets.${i}`}
                              value={bullet}
                              as="span"
                              multiline
                            />
                          ) : (
                            getLocalizedField(bullet, locale)
                          )}
                        </span>
                        {isEditing && slidePath && (
                          <button
                            type="button"
                            onClick={() => removeBullet(i)}
                            className="opacity-0 group-hover/bullet:opacity-100 transition-opacity shrink-0 text-primary-300 hover:text-red-400 p-0.5 mt-0.5"
                            aria-label="Remove bullet"
                            title="Remove bullet"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </li>
                    ))}
                    {isEditing && slidePath && (
                      <li className="ml-3 mt-2">
                        <button
                          type="button"
                          onClick={addBullet}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-400 hover:text-accent-300"
                        >
                          <Plus className="w-3 h-3" /> Add bullet
                        </button>
                      </li>
                    )}
                  </ul>
                ) : showDescription ? (
                  <div className="mb-6">
                    <p className="text-primary-200 leading-relaxed text-sm md:text-base max-w-lg">
                      {slidePath ? (
                        <EditableText
                          path={`${slidePath}.description`}
                          value={currentSlide.description}
                          as="span"
                          multiline
                        />
                      ) : (
                        descText
                      )}
                    </p>
                    {isEditing && slidePath && !hasBullets && (
                      <button
                        type="button"
                        onClick={convertDescriptionToBullets}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-accent-400/70 hover:text-accent-300"
                        title="Switch to bullet points instead of a paragraph"
                      >
                        <Plus className="w-3 h-3" /> Use bullet points instead
                      </button>
                    )}
                  </div>
                ) : null}

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {(primaryBtnText || isEditing) && (
                    <Button
                      href={section.primaryButtonLink}
                      variant="primary"
                      className="text-base px-7 py-3.5 !bg-accent-500 hover:!bg-accent-600 !shadow-accent-500/25"
                    >
                      <EditableText
                        path={`${basePath}.primaryButtonText`}
                        value={section.primaryButtonText}
                        as="span"
                      />
                    </Button>
                  )}
                  {showSecondary && (
                    <Button
                      href={renderedSecondaryHref}
                      variant="outline"
                      className="text-base px-7 py-3.5 border-white/30 text-white hover:shadow-lg hover:shadow-white/10 hover:border-white/60"
                    >
                      {slideHasOverride && slidePath ? (
                        <EditableText
                          path={`${slidePath}.ctaText`}
                          value={currentSlide.ctaText ?? EMPTY_LS}
                          as="span"
                        />
                      ) : (
                        <EditableText
                          path={`${basePath}.secondaryButtonText`}
                          value={section.secondaryButtonText}
                          as="span"
                        />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white rounded-full p-2 transition-all z-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white rounded-full p-2 transition-all z-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            {visible.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className={`relative h-2 rounded-full transition-all duration-300 overflow-hidden ${
                  i === activeIdx ? 'w-8 bg-primary-200' : 'w-2 bg-secondary-300 hover:bg-secondary-400'
                }`}
              >
                {i === activeIdx && !paused && !isEditing && (
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
