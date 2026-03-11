import { getLocalizedField } from '@/lib/locale'
import { ValuesSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Image from 'next/image'

interface ValuesGridProps {
  section: ValuesSection
  locale: Locale
}

export default function ValuesGrid({ section, locale }: ValuesGridProps) {
  const heading = getLocalizedField(section.heading, locale)

  return (
    <section id="values" className="py-20 bg-warm-50">
      <div className="container-padding">
        {section.imageUrl && (
          <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-12 shadow-lg group">
            <Image
              src={section.imageUrl}
              alt="Our values"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 via-primary-900/30 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-start pl-8 md:pl-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {heading}
              </h2>
            </div>
          </div>
        )}
        {!section.imageUrl && (
          <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary-800 mb-12">
            {heading}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {section.values.map((value, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-secondary-100"
            >
              <h3 className="text-xl font-semibold text-primary-600 mb-3">
                {getLocalizedField(value.title, locale)}
              </h3>
              <p className="text-secondary-600 leading-relaxed">
                {getLocalizedField(value.description, locale)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
