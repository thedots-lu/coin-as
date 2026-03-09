import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { FlexibleServicesSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import { Settings } from 'lucide-react'

interface FlexibleServicesProps {
  section: FlexibleServicesSection
  locale: Locale
}

export default function FlexibleServices({ section, locale }: FlexibleServicesProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-primary-50/30">
      <div className="container-padding">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 max-w-6xl mx-auto">
          <div className={section.imageUrl ? 'lg:w-1/2' : 'max-w-3xl mx-auto'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-secondary-700" />
              </div>
              <div className="h-px flex-grow bg-gradient-to-r from-secondary-200 to-transparent" />
            </div>
            {heading && (
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-800 mb-6">{heading}</h2>
            )}
            {body && (
              <p className="text-gray-600 leading-relaxed text-lg">{body}</p>
            )}
          </div>
          {section.imageUrl && (
            <div className="lg:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={section.imageUrl}
                    alt={heading || ''}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div
                    className="absolute inset-0 opacity-15 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-5"
                    style={{ background: 'linear-gradient(135deg, var(--color-secondary-600), var(--color-primary-700))' }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, var(--color-secondary-500), var(--color-primary-500))' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
