'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const DISMISS_KEY = 'newsletter-popup-dismissed'

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return
    const timer = setTimeout(() => setOpen(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm animate-in fade-in duration-300"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-8 md:p-10 animate-in fade-in zoom-in-95 duration-300">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 p-2 rounded-full text-secondary-500 hover:text-primary-900 hover:bg-warm-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-1 bg-accent-500 mb-6" />

        <h2
          id="newsletter-popup-title"
          className="font-display text-2xl md:text-3xl font-bold text-primary-900 leading-tight mb-4"
        >
          Stay informed. Stay compliant.
        </h2>
        <p className="text-secondary-600 leading-relaxed mb-8">
          Get insights on business continuity, cyber resilience and regulatory requirements.
        </p>

        <Link href="#" className="btn-primary inline-flex items-center justify-center w-full text-center">
          Subscribe to our newsletter
        </Link>
      </div>
    </div>
  )
}
