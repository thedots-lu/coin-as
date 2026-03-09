'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useScrollPosition } from '@/hooks/useScrollPosition'

export default function ScrollToTop() {
  const { isScrolled } = useScrollPosition()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
          aria-label="Scroll to top"
          type="button"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
