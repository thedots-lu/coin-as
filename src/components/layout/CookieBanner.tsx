'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

const CONSENT_KEY = 'coin-cookie-consent'

export type ConsentValue = 'accepted' | 'declined' | null

export function getConsent(): ConsentValue {
  if (typeof localStorage === 'undefined') return null
  return (localStorage.getItem(CONSENT_KEY) as ConsentValue) ?? null
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    // Notify ConsentScripts to load analytics
    window.dispatchEvent(new CustomEvent('coin:consent', { detail: 'accepted' }))
  }

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-secondary-200 shadow-lg"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="container-padding py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-secondary-600 text-sm max-w-xl">
                We use cookies to improve your experience and analyse site traffic.{' '}
                <Link href="/cookies-policy" className="text-primary-500 hover:underline font-medium">
                  Learn more
                </Link>
              </p>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleDecline}
                  className="text-sm font-medium text-secondary-500 hover:text-secondary-700 transition-colors px-4 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="btn-primary text-sm px-5 py-2"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
