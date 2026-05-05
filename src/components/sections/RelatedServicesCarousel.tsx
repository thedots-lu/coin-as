'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { ServiceDocument, ServiceCardAccent } from '@/lib/types/service'
import { Locale } from '@/lib/types/locale'
import { resolveFeatureIcon } from '@/lib/icons'
import { sanitizeRichHtml } from '@/lib/utils/html'

interface RelatedServicesCarouselProps {
  services: ServiceDocument[]
  locale?: Locale
}

const ACCENT_BAR: Record<ServiceCardAccent, string> = {
  primary: 'bg-primary-500',
  accent: 'bg-accent-500',
  red: 'bg-coin-red-500',
  'primary-dark': 'bg-primary-700',
}

const ACCENT_ICON: Record<ServiceCardAccent, { bg: string; color: string }> = {
  primary: { bg: 'bg-primary-50', color: 'text-primary-600' },
  accent: { bg: 'bg-accent-50', color: 'text-accent-600' },
  red: { bg: 'bg-coin-red-50', color: 'text-coin-red-600' },
  'primary-dark': { bg: 'bg-primary-50', color: 'text-primary-700' },
}

const COPIES = 3

export default function RelatedServicesCarousel({
  services,
  locale = 'en',
}: RelatedServicesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const isAdjustingRef = useRef(false)

  const n = services.length

  const getCardWidth = () => {
    const el = trackRef.current
    if (!el) return 0
    const firstCard = el.querySelector<HTMLElement>('[data-carousel-card]')
    return firstCard ? firstCard.offsetWidth + 24 : el.clientWidth
  }

  const jumpInstant = (left: number) => {
    const el = trackRef.current
    if (!el) return
    const prev = el.style.scrollBehavior
    el.style.scrollBehavior = 'auto'
    el.scrollLeft = left
    el.style.scrollBehavior = prev
  }

  // Position at start of middle copy on mount so the user can scroll freely
  // in both directions before we need to re-anchor.
  useEffect(() => {
    if (n === 0) return
    isAdjustingRef.current = true
    jumpInstant(n * getCardWidth())
    requestAnimationFrame(() => {
      isAdjustingRef.current = false
    })
  }, [n])

  // After each scroll settles, if the viewport has drifted out of the middle
  // copy, silently jump to the equivalent position inside the middle copy.
  // The visible cards are identical before/after the jump, so the user never
  // notices.
  useEffect(() => {
    const el = trackRef.current
    if (!el || n === 0) return

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const handleScroll = () => {
      if (isAdjustingRef.current) return
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const cw = getCardWidth()
        if (cw === 0) return
        const currentCard = Math.round(el.scrollLeft / cw)
        if (currentCard < n || currentCard >= 2 * n) {
          const targetCard = (currentCard % n) + n
          isAdjustingRef.current = true
          jumpInstant(targetCard * cw)
          requestAnimationFrame(() => {
            isAdjustingRef.current = false
          })
        }
      }, 150)
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [n])

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: direction * getCardWidth(), behavior: 'smooth' })
  }

  if (n === 0) return null

  const extended: ServiceDocument[] = []
  for (let i = 0; i < COPIES; i++) extended.push(...services)

  return (
    <section className="py-16 bg-warm-50">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <div className="w-12 h-1 bg-accent-500 rounded-full mb-4" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-900">
                Explore our other services
              </h2>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Previous"
                className="w-10 h-10 rounded-full border border-secondary-200 bg-white flex items-center justify-center text-secondary-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Next"
                className="w-10 h-10 rounded-full border border-secondary-200 bg-white flex items-center justify-center text-secondary-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4"
            style={{ scrollbarWidth: 'none' }}
          >
            {extended.map((service, index) => {
              const slug = service.slug ?? service.id
              const card = service.card
              const accent = card?.accent ?? 'primary'
              const Icon = resolveFeatureIcon(card?.icon ?? '') ?? Briefcase
              const title =
                getLocalizedField(card?.title, locale) || getLocalizedField(service.title, locale)
              const body = getLocalizedField(card?.body, locale)
              const fallback = !card ? getLocalizedField(service.heroSubtitle, locale) : ''
              const isClone = index < n || index >= 2 * n

              return (
                <Link
                  key={`${slug}-${index}`}
                  href={`/services/${slug}`}
                  data-carousel-card
                  aria-hidden={isClone ? true : undefined}
                  tabIndex={isClone ? -1 : undefined}
                  className="group snap-start shrink-0 basis-full md:basis-[calc((100%-3rem)/3)] bg-white rounded-2xl p-8 shadow-sm border border-secondary-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className={`w-10 h-1 ${ACCENT_BAR[accent]} rounded-full mb-5`} />
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${ACCENT_ICON[accent].bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${ACCENT_ICON[accent].color}`} strokeWidth={2} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-primary-900 leading-tight pt-1 group-hover:text-primary-600 transition-colors">
                      {title}
                    </h3>
                  </div>
                  {body ? (
                    <div
                      className="text-secondary-600 leading-relaxed mb-6 flex-1 prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-2 [&_li]:my-0.5 [&_li]:marker:text-accent-500"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(body) }}
                    />
                  ) : (
                    fallback && (
                      <p className="text-secondary-600 leading-relaxed mb-6 flex-1">{fallback}</p>
                    )
                  )}
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:text-primary-800 transition-colors">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
