import { getLocalizedField } from '@/lib/locale'
import { Locale, LocaleString } from '@/lib/types/locale'
import Button from '@/components/ui/Button'

interface ComplianceCTAProps {
  heading: LocaleString
  body: LocaleString
  locale: Locale
}

export default function ComplianceCTA({ heading, body, locale }: ComplianceCTAProps) {
  const headingText = getLocalizedField(heading, locale)
  const bodyText = getLocalizedField(body, locale)

  return (
    <section className="py-20">
      <div className="container-padding">
        <div
          className="rounded-2xl p-10 md:p-16 text-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-secondary-700) 100%)',
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {headingText}
          </h2>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto mb-8">
            {bodyText}
          </p>
          <Button
            href="/contact"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-primary-700"
          >
            {locale === 'fr'
              ? 'Contactez-nous'
              : locale === 'nl'
              ? 'Contacteer ons'
              : 'Contact us'}
          </Button>
        </div>
      </div>
    </section>
  )
}
