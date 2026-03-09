import { Phone, Mail, MapPin } from 'lucide-react'
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
    <section className="py-16 bg-gradient-to-br from-gray-50 to-primary-50/20">
      <div className="container-padding max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-800 mb-4">{heading}</h1>
          {subtitle && <p className="text-gray-600 text-lg leading-relaxed">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {section.phones.map((phone, i) => (
            <div key={i} className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">{getLocalizedField(phone.label, locale)}</p>
                <a href={`tel:${phone.number.replace(/\s/g, '')}`} className="font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                  {phone.number}
                </a>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-0.5">Email</p>
              <a href="mailto:info@coincollocation.com" className="font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                info@coincollocation.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
