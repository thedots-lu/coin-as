import { Phone, Mail, MapPin, ArrowRight, Building2 } from 'lucide-react'
import Link from 'next/link'
import { getLocalizedField } from '@/lib/locale'
import { ContactInfoSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'

interface ContactInfoProps {
  section: ContactInfoSection
  locale: Locale
}

const offices = [
  {
    country: 'Netherlands',
    city: 'Schiphol-Rijk',
    phone: '+31 88 26 46 000',
    color: 'bg-primary-500',
  },
  {
    country: 'Luxembourg',
    city: 'Munsbach',
    phone: '+352 357 05 30',
    color: 'bg-coin-red-500',
  },
  {
    country: 'Belgium',
    city: 'Antwerp',
    phone: '',
    color: 'bg-accent-500',
  },
]

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

      {/* Office cards */}
      <div className="container-padding pt-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {offices.map((office) => {
            const Wrapper = office.phone ? 'a' : 'div'
            const wrapperProps = office.phone
              ? { href: `tel:${office.phone.replace(/\s/g, '')}` }
              : {}
            return (
              <Wrapper
                key={office.city}
                {...wrapperProps}
                className="group bg-white rounded-2xl p-6 shadow-lg border border-secondary-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Color accent top bar */}
                <div className={`w-10 h-1 ${office.color} rounded-full mb-5`} />

                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="font-bold text-primary-900 text-lg font-display">{office.city}</p>
                    <p className="text-xs uppercase tracking-wider text-secondary-400 font-medium">{office.country}</p>
                  </div>
                </div>

                {office.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary-500 shrink-0" />
                    <span className="text-secondary-800 font-semibold group-hover:text-primary-600 transition-colors">
                      {office.phone}
                    </span>
                  </div>
                )}
              </Wrapper>
            )
          })}
        </div>

        {/* Email + Map row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto mt-5">
          <a
            href="mailto:info@coin-bc.com"
            className="group flex items-center gap-5 bg-white rounded-2xl p-6 shadow-lg border border-secondary-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-secondary-400 font-medium mb-1">Email</p>
              <p className="text-lg font-bold text-primary-900 group-hover:text-primary-600 transition-colors">info@coin-bc.com</p>
            </div>
          </a>

          <Link
            href="/locations"
            className="group flex items-center gap-5 bg-primary-950 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
              <MapPin className="w-6 h-6 text-accent-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-primary-300 font-medium mb-1">4 centres across BeNeLux</p>
              <p className="text-lg font-bold text-white">See all locations on the map</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  )
}
