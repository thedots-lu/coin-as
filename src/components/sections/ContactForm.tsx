'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { ContactFormSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'

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

const inputClass =
  'w-full px-4 py-3 bg-white border border-secondary-200 rounded-xl text-secondary-800 placeholder:text-secondary-300 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-200'

const labelClass = 'block text-sm font-semibold text-secondary-700 mb-2'

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

  useEffect(() => {
    const a = Math.floor(Math.random() * 9) + 1
    const b = Math.floor(Math.random() * 9) + 1
    setCaptcha({ a, b, answer: a + b })
  }, [])

  const labels = section.formLabels
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

    if (honeypot) return

    if (!validate()) {
      setError('Please fill in all required fields and accept the GDPR consent.')
      return
    }

    if (parseInt(captchaAnswer, 10) !== captcha.answer) {
      setError('The anti-spam verification is incorrect.')
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
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="py-20 bg-warm-50">
        <div className="container-padding max-w-xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-secondary-100">
            <div className="w-16 h-16 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-2xl font-bold text-primary-900 font-display mb-3">
              Message sent
            </h3>
            <p className="text-secondary-600 leading-relaxed">
              {confirmationMsg || 'We will get back to you within 24 hours.'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-warm-50">
      <div className="container-padding max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Left: Form */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-primary-900 font-display mb-2">
              Send us a message
            </h2>
            <p className="text-secondary-500 mb-8">
              Fields marked with * are required.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Subject */}
              <div>
                <label className={labelClass}>
                  {getLocalizedField(labels.subject, locale)} *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Select a subject</option>
                  {section.subjectOptions?.map((opt, i) => {
                    const val = getLocalizedField(opt, locale)
                    return <option key={i} value={val}>{val}</option>
                  })}
                </select>
              </div>

              {/* Company + Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    {getLocalizedField(labels.company, locale)}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    {getLocalizedField(labels.name, locale)} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    {getLocalizedField(labels.phone, locale)}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    {getLocalizedField(labels.email, locale)} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className={labelClass}>
                  {getLocalizedField(labels.country, locale)} *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Select a country</option>
                  {section.countryOptions?.map((opt, i) => {
                    const val = getLocalizedField(opt, locale)
                    return <option key={i} value={val}>{val}</option>
                  })}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className={labelClass}>
                  {getLocalizedField(labels.message, locale)} *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  required
                  rows={5}
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Honeypot */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Verification block */}
              <div className="border-t border-secondary-200 pt-6 space-y-4">
                {/* CAPTCHA */}
                {captcha.a > 0 && (
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold text-secondary-700 whitespace-nowrap">
                      What is {captcha.a} + {captcha.b}? *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      required
                      className="w-20 px-3 py-2.5 bg-white border border-secondary-200 rounded-xl text-center text-lg font-bold focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                )}

                {/* GDPR */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="gdpr-consent"
                    checked={formData.gdprConsent}
                    onChange={(e) => handleChange('gdprConsent', e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 border-secondary-300 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="gdpr-consent" className="text-xs text-secondary-500 leading-relaxed">
                    I consent to COIN processing my personal data to respond to this enquiry, per the{' '}
                    <a href="/privacy-policy" target="_blank" className="text-primary-600 underline hover:text-primary-800">
                      Privacy Policy
                    </a>. My data will not be shared with third parties.
                  </label>
                </div>
              </div>

              {error && (
                <p className="text-coin-red-500 text-sm font-medium">{error}</p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={!formData.gdprConsent || !captchaAnswer || submitting}
                className="inline-flex items-center gap-3 bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="w-5 h-5" />
                <span>{submitting ? 'Sending...' : 'Send message'}</span>
              </button>
            </form>
          </div>

          {/* Right: sidebar info */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 space-y-6">
              {/* Direct contact card */}
              <div className="bg-primary-950 rounded-2xl p-8 text-white">
                <h3 className="text-lg font-bold font-display mb-1">Prefer to talk?</h3>
                <p className="text-primary-300 text-sm mb-6">Call us directly at any of our offices.</p>

                <div className="space-y-4">
                  <a href="tel:+31882646000" className="flex items-center gap-3 text-white hover:text-accent-400 transition-colors">
                    <span className="text-xs font-bold bg-white/10 rounded px-2 py-1">NL</span>
                    <span className="font-semibold">+31 88 26 46 000</span>
                  </a>
                  <a href="tel:+35235705030" className="flex items-center gap-3 text-white hover:text-accent-400 transition-colors">
                    <span className="text-xs font-bold bg-white/10 rounded px-2 py-1">LU</span>
                    <span className="font-semibold">+352 357 05 30</span>
                  </a>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <a href="mailto:info@coin-bc.com" className="text-accent-400 hover:text-accent-300 font-semibold transition-colors">
                    info@coin-bc.com
                  </a>
                </div>
              </div>

              {/* Response time */}
              <div className="bg-white rounded-2xl p-6 border border-secondary-100">
                <p className="text-sm text-secondary-500">
                  <span className="font-bold text-secondary-800 block mb-1">Response within 24h</span>
                  Our team processes enquiries on business days. For urgent matters, call us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
