import { Mail, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'
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

      {/* Email + Map row */}
      <div className="container-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
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
