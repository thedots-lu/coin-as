'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { Site } from '@/lib/types/site'
import { Locale } from '@/lib/types/locale'
import { siteSlug } from '@/lib/firestore/sites'

interface Props {
  sites: Site[]
  locale?: Locale
}

const COPIES = 3

/**
 * Bottom-of-page carousel listing the other locations. Same horizontal
 * scroll-snap pattern as RelatedServicesCarousel — cards loop seamlessly by
 * rendering three copies and silently re-anchoring once the user drifts out
 * of the middle copy. Each card is a building image with the site name +
 * country overlaid bottom-left, and a "Discover" link below.
 */
export default function RelatedSitesCarousel({ sites, locale = 'en' }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const isAdjustingRef = useRef(false)
  const n = sites.length

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

  useEffect(() => {
    if (n === 0) return
    isAdjustingRef.current = true
    jumpInstant(n * getCardWidth())
    requestAnimationFrame(() => {
      isAdjustingRef.current = false
    })
  }, [n])

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

  const extended: Site[] = []
  for (let i = 0; i < COPIES; i++) extended.push(...sites)

  return (
    <section className="py-16 bg-warm-50">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <div className="w-12 h-1 bg-accent-500 rounded-full mb-4" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-900">
                Take a look at our other business continuity centres
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
            {extended.map((site, index) => {
              const slug = siteSlug(site)
              const name = getLocalizedField(site.name, locale)
              const country = getLocalizedField(site.country, locale)
              const isClone = index < n || index >= 2 * n

              return (
                <Link
                  key={`${slug}-${index}`}
                  href={`/locations/${slug}`}
                  data-carousel-card
                  aria-hidden={isClone ? true : undefined}
                  tabIndex={isClone ? -1 : undefined}
                  className="group snap-start shrink-0 basis-full md:basis-[calc((100%-3rem)/3)] bg-white rounded-2xl shadow-sm border border-secondary-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary-50">
                    {site.imageUrl && (
                      <Image
                        src={site.imageUrl}
                        alt={`COIN ${name} site`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-xl font-bold text-white leading-tight">
                        {name}
                      </h3>
                      {country && (
                        <p className="text-[11px] text-primary-100 uppercase tracking-wider font-medium mt-0.5">
                          {country}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:text-primary-800 transition-colors">
                      <span>Discover</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
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
