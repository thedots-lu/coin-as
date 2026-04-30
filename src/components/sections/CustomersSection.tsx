import { getLocalizedField } from '@/lib/locale'
import { CustomersSection as CustomersSectionType } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import LogoMarquee from '@/components/sections/LogoMarquee'

interface CustomersSectionProps {
  section: CustomersSectionType
  locale: Locale
  /**
   * Logos sourced from the `customer_logos` collection — the single source of
   * truth shared with the homepage Trusted-by marquee.
   */
  customerLogos?: Array<{ url: string; name: string }>
}

export default function CustomersSection({ section, locale, customerLogos }: CustomersSectionProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)
  const logos = customerLogos ?? []

  return (
    <section id="customers" className="py-20 bg-secondary-50 overflow-hidden scroll-mt-24">
      <div className="container-padding">
        <AnimatedSection animation="slideUp" className="text-center mb-6">
          {heading && (
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">{heading}</h2>
          )}
        </AnimatedSection>

        {body && (
          <AnimatedSection animation="slideUp" className="text-center mb-12">
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">{body}</p>
          </AnimatedSection>
        )}
      </div>

      {logos.length > 0 ? (
        <LogoMarquee logos={logos} />
      ) : (
        <div className="text-center container-padding">
          <p className="text-secondary-500">
            Trusted by leading organizations across the BeNeLux.
          </p>
        </div>
      )}
    </section>
  )
}
