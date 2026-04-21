'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { ServiceDocument } from '@/lib/types/service'
import { Locale } from '@/lib/types/locale'

interface RelatedServicesCarouselProps {
  services: ServiceDocument[]
  locale?: Locale
}

export default function RelatedServicesCarousel({
  services,
  locale = 'en',
}: RelatedServicesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateEdges()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [updateEdges])

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const firstCard = el.querySelector<HTMLElement>('[data-carousel-card]')
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : el.clientWidth
    el.scrollBy({ left: direction * cardWidth, behavior: 'smooth' })
  }

  if (services.length === 0) return null

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
                disabled={atStart}
                aria-label="Previous"
                className="w-10 h-10 rounded-full border border-secondary-200 bg-white flex items-center justify-center text-secondary-700 hover:border-primary-500 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={atEnd}
                aria-label="Next"
                className="w-10 h-10 rounded-full border border-secondary-200 bg-white flex items-center justify-center text-secondary-700 hover:border-primary-500 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
            {services.map((service) => {
              const slug = service.slug ?? service.id
              const title = getLocalizedField(service.title, locale)
              const description = getLocalizedField(service.heroSubtitle, locale)

              return (
                <Link
                  key={slug}
                  href={`/services/${slug}`}
                  data-carousel-card
                  className="group snap-start shrink-0 basis-full md:basis-[calc((100%-3rem)/3)] bg-white rounded-2xl p-8 shadow-sm border border-secondary-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="w-10 h-1 bg-accent-500 rounded-full mb-5" />
                  <h3 className="font-display text-xl font-bold text-primary-900 leading-tight mb-3 group-hover:text-primary-600 transition-colors">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-secondary-600 leading-relaxed mb-6 flex-1">
                      {description}
                    </p>
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
