import Image from 'next/image'
import { getLocalizedField } from '@/lib/locale'
import { MissionStatementSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import { Crosshair } from 'lucide-react'

interface MissionStatementProps {
  section: MissionStatementSection
  locale: Locale
}

export default function MissionStatement({ section, locale }: MissionStatementProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="py-24 bg-white">
      <div className="container-padding">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
          <div className={section.imageUrl ? 'lg:w-1/2' : 'max-w-3xl mx-auto'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Crosshair className="w-5 h-5 text-primary-600" />
              </div>
              <div className="h-px flex-grow bg-gradient-to-r from-primary-200 to-transparent" />
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
                    className="absolute inset-0 opacity-10 mix-blend-overlay"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary-500), transparent)' }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500))' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
