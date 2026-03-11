import { getLocalizedField } from '@/lib/locale'
import { BusinessCaseSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'

interface BusinessCaseProps {
  section: BusinessCaseSection
  locale: Locale
}

export default function BusinessCase({ section, locale }: BusinessCaseProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="py-20">
      <div className="container-padding">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className={section.imageUrl ? 'lg:w-1/2' : 'max-w-3xl mx-auto'}>
            {heading && (
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{heading}</h2>
            )}
            {body && (
              <div
                className="text-secondary-700 leading-relaxed text-lg"
                style={{ whiteSpace: 'pre-line' }}
              >
                {body}
              </div>
            )}
          </div>
          {section.imageUrl && (
            <div className="lg:w-1/2">
              <img
                src={section.imageUrl}
                alt={heading || ''}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
