'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { getLocalizedField } from '@/lib/locale'
import type { NavChild } from '@/lib/types/navigation'

interface MegaMenuProps {
  children: NavChild[]
  parentPath: string
  isOpen: boolean
  onClose: () => void
}

export default function MegaMenu({ children, parentPath, isOpen, onClose }: MegaMenuProps) {
  const locale = 'en'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute top-full left-0 mt-1 min-w-[220px] bg-white rounded-lg shadow-lg border-t-2 border-primary-500 py-2 z-50"
        >
          {children
            .filter((c) => c.path !== parentPath)
            .sort((a, b) => a.order - b.order)
            .map((child) => {
              const label = getLocalizedField(child.label, locale)
              return (
                <Link
                  key={child.path}
                  href={child.path}
                  onClick={onClose}
                  className="block px-5 py-2.5 text-secondary-600 hover:text-primary-500 hover:bg-primary-50 font-medium transition-colors duration-150"
                >
                  {label || 'Link'}
                </Link>
              )
            })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
