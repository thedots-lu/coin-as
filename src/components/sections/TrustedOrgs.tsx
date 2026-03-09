'use client'

import { useRef, useEffect } from 'react'
import { getLocalizedField } from '@/lib/locale'
import { Locale, LocaleString } from '@/lib/types/locale'

interface TrustedOrgsProps {
  logoUrls: string[]
  heading?: LocaleString
  locale: Locale
}

export default function TrustedOrgs({ logoUrls, heading, locale }: TrustedOrgsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)

  const headingText = heading ? getLocalizedField(heading, locale) : ''

  useEffect(() => {
    const container = scrollRef.current
    if (!container || logoUrls.length === 0) return

    let scrollPos = 0
    const speed = 0.5

    const animate = () => {
      scrollPos += speed
      if (scrollPos >= container.scrollWidth / 2) {
        scrollPos = 0
      }
      container.scrollLeft = scrollPos
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [logoUrls])

  if (logoUrls.length === 0) return null

  // Duplicate logos for seamless scroll
  const allLogos = [...logoUrls, ...logoUrls]

  return (
    <section className="py-16 bg-white">
      <div className="container-padding">
        {headingText && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            {headingText}
          </h2>
        )}

        <div
          ref={scrollRef}
          className="flex items-center gap-12 overflow-hidden"
        >
          {allLogos.map((url, index) => (
            <img
              key={index}
              src={url}
              alt=""
              className="h-12 md:h-16 w-auto object-contain shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
