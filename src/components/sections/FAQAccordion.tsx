'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import { Locale, LocaleString } from '@/lib/types/locale'

interface FAQItem {
  question: LocaleString
  answer: LocaleString
}

interface FAQAccordionProps {
  items: FAQItem[]
  locale: Locale
}

export default function FAQAccordion({ items, locale }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section className="py-20">
      <div className="container-padding max-w-3xl mx-auto">
        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index
            const question = getLocalizedField(item.question, locale)
            const answer = getLocalizedField(item.answer, locale)

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-secondary-800 pr-4">
                    {question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                        {answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
