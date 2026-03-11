'use client'

import { useState, FormEvent } from 'react'
import { getLocalizedField } from '@/lib/locale'
import { ContactFormSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Button from '@/components/ui/Button'

interface ContactFormProps {
  section: ContactFormSection
  locale: Locale
}

interface FormData {
  subject: string
  company: string
  name: string
  phone: string
  email: string
  country: string
  message: string
  gdprConsent: boolean
}

export default function ContactForm({ section, locale }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    company: '',
    name: '',
    phone: '',
    email: '',
    country: '',
    message: '',
    gdprConsent: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const labels = section.formLabels
  const privacyText = getLocalizedField(section.privacyText, locale)
  const gdprText = getLocalizedField(section.gdprConsentText, locale)
  const confirmationMsg = getLocalizedField(section.confirmationMessage, locale)

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validate = (): boolean => {
    if (!formData.subject.trim()) return false
    if (!formData.name.trim()) return false
    if (!formData.email.trim()) return false
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return false
    if (!formData.country.trim()) return false
    if (!formData.message.trim()) return false
    if (!formData.gdprConsent) return false
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) {
      setError(
        locale === 'fr'
          ? 'Veuillez remplir tous les champs obligatoires et accepter le consentement RGPD.'
          : locale === 'nl'
          ? 'Vul alle verplichte velden in en accepteer de AVG-toestemming.'
          : 'Please fill in all required fields and accept the GDPR consent.'
      )
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, locale }),
      })

      if (!res.ok) throw new Error('Failed to send')
      setSubmitted(true)
    } catch {
      setError(
        locale === 'fr'
          ? "Une erreur s'est produite. Veuillez reessayer."
          : locale === 'nl'
          ? 'Er is een fout opgetreden. Probeer opnieuw.'
          : 'An error occurred. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="py-20">
        <div className="container-padding max-w-2xl mx-auto text-center">
          <div className="glass-card p-12">
            <h3 className="text-2xl font-semibold text-primary-700 mb-4">
              {locale === 'fr'
                ? 'Message envoye !'
                : locale === 'nl'
                ? 'Bericht verzonden!'
                : 'Message sent!'}
            </h3>
            <p className="text-secondary-600">
              {confirmationMsg || (locale === 'fr'
                ? 'Nous vous recontacterons dans les plus brefs delais.'
                : locale === 'nl'
                ? 'We nemen zo snel mogelijk contact met u op.'
                : 'We will get back to you as soon as possible.')}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20">
      <div className="container-padding max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {getLocalizedField(labels.subject, locale)} *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              required
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="">
                {locale === 'fr' ? '-- Choisissez un sujet --' : locale === 'nl' ? '-- Kies een onderwerp --' : '-- Select a subject --'}
              </option>
              {section.subjectOptions?.map((opt, i) => {
                const val = getLocalizedField(opt, locale)
                return (
                  <option key={i} value={val}>
                    {val}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {getLocalizedField(labels.company, locale)}
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {getLocalizedField(labels.name, locale)} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {getLocalizedField(labels.phone, locale)}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {getLocalizedField(labels.email, locale)} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {getLocalizedField(labels.country, locale)} *
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              required
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="">
                {locale === 'fr' ? '-- Choisissez un pays --' : locale === 'nl' ? '-- Kies een land --' : '-- Select a country --'}
              </option>
              {section.countryOptions?.map((opt, i) => {
                const val = getLocalizedField(opt, locale)
                return (
                  <option key={i} value={val}>
                    {val}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {getLocalizedField(labels.message, locale)} *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-y"
            />
          </div>

          {/* GDPR Consent */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="gdpr-consent"
              checked={formData.gdprConsent}
              onChange={(e) => handleChange('gdprConsent', e.target.checked)}
              required
              className="mt-1 h-4 w-4 border-secondary-300 rounded text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="gdpr-consent" className="text-sm text-secondary-600">
              {gdprText}
            </label>
          </div>

          {error && (
            <p className="text-accent-600 text-sm">{error}</p>
          )}

          {privacyText && (
            <p className="text-xs text-secondary-500">{privacyText}</p>
          )}

          <Button type="submit" variant="primary" className="w-full md:w-auto">
            {submitting
              ? '...'
              : getLocalizedField(labels.submit, locale)}
          </Button>
        </form>
      </div>
    </section>
  )
}
