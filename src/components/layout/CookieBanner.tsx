'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

const COOKIE_CONSENT_KEY = 'coin-cookie-consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
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
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
        >
          <div className="container-padding py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-secondary-600 text-sm">
                This website uses cookies to ensure you get the best experience.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/cookies-policy"
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
                >
                  Learn more
                </Link>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="btn-primary text-sm px-5 py-2"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
