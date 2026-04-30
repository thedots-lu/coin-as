'use client'

import { Lock } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { CustomersSection as CustomersSectionType } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import LogoMarquee from '@/components/sections/LogoMarquee'
import EditableText from '@/components/admin/cms/EditableText'
import { useEditing } from '@/components/admin/cms/EditingContext'

interface CustomersSectionProps {
  section: CustomersSectionType
  locale: Locale
  basePath: string
  /**
   * Logos sourced from the `customer_logos` collection — the single source of
   * truth shared with the homepage Trusted-by marquee.
   */
  customerLogos?: Array<{ url: string; name: string }>
}

export default function CustomersSection({ section, locale, basePath, customerLogos }: CustomersSectionProps) {
  const isEditing = !!useEditing()
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)
  const logos = customerLogos ?? []

  return (
    <section id="customers" className="py-20 bg-secondary-50 overflow-hidden scroll-mt-24">
      <div className="container-padding">
        {(heading || isEditing) && (
          <AnimatedSection animation="slideUp" className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              <EditableText
                path={`${basePath}.heading`}
                value={section.heading}
                as="span"
                multiline
              />
            </h2>
          </AnimatedSection>
        )}

        {(body || isEditing) && (
          <AnimatedSection animation="slideUp" className="text-center mb-12">
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              <EditableText
                path={`${basePath}.body`}
                value={section.body}
                as="span"
                multiline
              />
            </p>
          </AnimatedSection>
        )}
      </div>

      {isEditing && (
        <div className="container-padding mb-4">
          <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-md px-4 py-2.5 text-[12px] text-amber-900 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>
              The logo carousel is managed in{' '}
              <a
                href="/admin/customer-logos"
                className="font-semibold underline hover:no-underline"
              >
                Customer Logos
              </a>
              .
            </span>
          </div>
        </div>
      )}

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
