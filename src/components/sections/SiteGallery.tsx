'use client'

import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { SiteGallerySection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface SiteGalleryProps {
  section: SiteGallerySection
  locale: Locale
}

export default function SiteGallery({ section, locale }: SiteGalleryProps) {
  return (
    <section className="py-20 bg-secondary-50">
      <div className="container-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.sites.map((site, index) => {
            const name = getLocalizedField(site.name, locale)
            const country = getLocalizedField(site.country, locale)

            return (
              <AnimatedSection
                key={index}
                animation="zoomIn"
                delay={index * 0.1}
              >
                <div className="group relative rounded-xl overflow-hidden aspect-[4/3]">
                  <Image
                    src={site.imageUrl}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold text-white">{name}</h3>
                    {country && (
                      <p className="text-primary-200 text-sm mt-1">{country}</p>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
