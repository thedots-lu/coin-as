'use client'

import { useState, useEffect, FormEvent } from 'react'
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
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captcha, setCaptcha] = useState({ a: 0, b: 0, answer: 0 })
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Generate CAPTCHA client-side only to avoid hydration mismatch
  useEffect(() => {
    const a = Math.floor(Math.random() * 9) + 1
    const b = Math.floor(Math.random() * 9) + 1
    setCaptcha({ a, b, answer: a + b })
  }, [])

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

    // Honeypot check (bots fill hidden fields)
    if (honeypot) return

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

    if (parseInt(captchaAnswer, 10) !== captcha.answer) {
      setError(
        locale === 'fr'
          ? 'La verification anti-spam est incorrecte.'
          : locale === 'nl'
          ? 'De anti-spam verificatie is onjuist.'
          : 'The anti-spam verification is incorrect.'
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
      <section className="pt-8 pb-20">
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
    <section className="pt-8 pb-20">
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

          {/* Honeypot — hidden from humans, bots fill it */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Divider before verification section */}
          <div className="border-t border-secondary-200 pt-6 mt-2 space-y-5">
            {/* CAPTCHA — prominent */}
            {captcha.a > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                <label className="block text-sm font-bold text-primary-800 mb-2">
                  {locale === 'fr'
                    ? `Verification anti-spam : combien font ${captcha.a} + ${captcha.b}`
                    : locale === 'nl'
                    ? `Anti-spam verificatie: hoeveel is ${captcha.a} + ${captcha.b}`
                    : `Anti-spam verification: what is ${captcha.a} + ${captcha.b}`} *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  required
                  className="w-28 px-4 py-2.5 border-2 border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white text-center text-lg font-semibold"
                />
              </div>
            )}

            {/* GDPR Consent — visually distinct */}
            <div className="bg-warm-100 border border-secondary-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="gdpr-consent"
                  checked={formData.gdprConsent}
                  onChange={(e) => handleChange('gdprConsent', e.target.checked)}
                  required
                  className="mt-0.5 h-5 w-5 border-secondary-400 rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="gdpr-consent" className="text-sm text-secondary-700 leading-relaxed">
                  I consent to COIN processing my personal data solely to respond to this enquiry, in accordance with the{' '}
                  <a href="/privacy-policy" target="_blank" className="text-primary-600 font-semibold underline hover:text-primary-800">Privacy Policy</a>.
                  {' '}My data will not be shared with third parties. I can request access, correction or deletion of my data at any time by contacting COIN.
                </label>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-coin-red-500 text-sm font-medium">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full md:w-auto"
            disabled={!formData.gdprConsent || !captchaAnswer || submitting}
          >
            {submitting
              ? '...'
              : getLocalizedField(labels.submit, locale)}
          </Button>
        </form>

        {/* Locations card */}
        <a
          href="/locations"
          className="mt-12 flex items-center gap-5 p-5 rounded-xl border border-primary-100 bg-primary-50/40 hover:bg-primary-50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-secondary-800 text-base mb-0.5">Our Business Continuity Centres</p>
            <p className="text-sm text-secondary-500">4 resilience centres across Luxembourg, Netherlands &amp; Belgium — 1,000+ recovery workplaces</p>
          </div>
          <svg className="w-5 h-5 text-primary-400 group-hover:translate-x-1 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </a>
      </div>
    </section>
  )
}
