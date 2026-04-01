'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import type { NavItem } from '@/lib/types/navigation'

interface MobileNavProps {
  navItems: NavItem[]
  isOpen: boolean
  onClose: () => void
}

export default function MobileNav({ navItems, isOpen, onClose }: MobileNavProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const locale = 'en'

  const toggleExpand = (path: string) => {
    setExpandedItem((prev) => (prev === path ? null : path))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-20 bg-black/40 z-[60] lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.nav
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-20 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl z-[70] overflow-y-auto lg:hidden"
          >
            <div className="py-4">
              {navItems
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                  const label = getLocalizedField(item.label, locale)
                  const hasChildren = item.children && item.children.length > 0
                  const isExpanded = expandedItem === item.path

                  return (
                    <div key={item.path} className="border-b border-secondary-100">
                      {hasChildren ? (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.path)}
                            className="flex items-center justify-between w-full px-6 py-3.5 text-secondary-600 hover:text-primary-500 hover:bg-primary-50 font-medium transition-colors duration-150"
                          >
                            <span>{label || 'Menu'}</span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          <AnimatePresence>
                            {isExpanded && item.children && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden bg-warm-50"
                              >
                                {item.children
                                  .sort((a, b) => a.order - b.order)
                                  .map((child) => {
                                    const childLabel = getLocalizedField(child.label, locale)
                                    return (
                                      <Link
                                        key={child.path}
                                        href={child.path}
                                        onClick={onClose}
                                        className="block px-10 py-3 text-secondary-500 hover:text-primary-500 hover:bg-primary-50 text-sm font-medium transition-colors duration-150"
                                      >
                                        {childLabel || 'Link'}
                                      </Link>
                                    )
                                  })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={item.path}
                          onClick={onClose}
                          className="block px-6 py-3.5 text-secondary-600 hover:text-primary-500 hover:bg-primary-50 font-medium transition-colors duration-150"
                        >
                          {label || 'Link'}
                        </Link>
                      )}
                    </div>
                  )
                })}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}
