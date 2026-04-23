import { getLocalizedField } from '@/lib/locale'
import { ValuesSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'

interface ValuesGridProps {
  section: ValuesSection
  locale: Locale
}

export default function ValuesGrid({ section, locale }: ValuesGridProps) {
  const heading = getLocalizedField(section.heading, locale)

  return (
    <section id="values" className="py-20 bg-warm-50 scroll-mt-24">
      <div className="container-padding">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">
          {heading}
        </h2>
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
