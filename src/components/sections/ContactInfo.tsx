import { Phone, Mail, MapPin, ArrowRight, Building2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
    address: 'Tupolevlaan 41, 1119 PA Schiphol-Rijk',
    color: 'bg-primary-500',
  },
  {
    country: 'Luxembourg',
    city: 'Munsbach',
    phone: '+352 357 05 30',
    address: '6B rue Gabriel Lippmann, L-5365 Munsbach',
    color: 'bg-coin-red-500',
  },
  {
    country: 'Belgium',
    city: 'Machelen',
    phone: '+32 2 513 36 18',
    address: 'De Kleetlaan 12B, 1831 Machelen',
    color: 'bg-accent-500',
  },
]

export default function ContactInfo({ section, locale }: ContactInfoProps) {
  const heading = getLocalizedField(section.heading, locale)
  const subtitle = getLocalizedField(section.subtitle, locale)

  return (
    <section className="relative overflow-hidden">
      {/* Dark hero strip with photo */}
      <div className="relative bg-primary-950 text-white">
        <Image
          src="/images/coin/coin-fotosharonwillems-60.webp"
          alt="COIN team in discussion"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/95 via-primary-950/80 to-primary-950/60" />

        <div className="container-padding relative z-10 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="w-12 h-1 bg-accent-500 mb-6 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
              {heading || 'Contact us'}
            </h1>
            {subtitle && (
              <p className="text-primary-200 text-lg md:text-xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Office cards — overlapping the hero */}
      <div className="container-padding -mt-8 relative z-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {offices.map((office) => (
            <a
              key={office.city}
              href={`tel:${office.phone.replace(/\s/g, '')}`}
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

              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-primary-500 shrink-0" />
                <span className="text-secondary-800 font-semibold group-hover:text-primary-600 transition-colors">
                  {office.phone}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-secondary-300 shrink-0 mt-0.5" />
                <span className="text-sm text-secondary-500 leading-snug">{office.address}</span>
              </div>
            </a>
          ))}
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
