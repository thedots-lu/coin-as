import { getLocalizedField } from '@/lib/locale'
import { ContactInfoSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'

interface ContactInfoProps {
  section: ContactInfoSection
  locale: Locale
}


export default function ContactInfo({ section, locale }: ContactInfoProps) {
  const heading = getLocalizedField(section.heading, locale)
  const subtitle = getLocalizedField(section.subtitle, locale)

  return (
    <section className="relative overflow-hidden">
      {/* Minimal banner */}
      <div className="bg-warm-50 border-b border-secondary-100">
        <div className="container-padding py-10 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="w-12 h-1 bg-accent-500 rounded-full mb-4" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 font-display tracking-tight">
              {heading || 'Contact us'}
            </h1>
            {subtitle && (
              <p className="text-secondary-600 text-base md:text-lg mt-3 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
