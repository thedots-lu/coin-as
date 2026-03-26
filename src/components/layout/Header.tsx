'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { getLocalizedField } from '@/lib/locale'
import MegaMenu from '@/components/layout/MegaMenu'
import MobileNav from '@/components/layout/MobileNav'
import type { NavItem } from '@/lib/types/navigation'
import type { SiteConfig } from '@/lib/types/site-config'

interface HeaderProps {
  navItems: NavItem[]
  siteConfig: SiteConfig | null
}

export default function Header({ navItems, siteConfig }: HeaderProps) {
  const { isScrolled } = useScrollPosition()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const locale = 'en'

  const handleMenuOpen = useCallback((path: string) => {
    setOpenMenu((prev) => (prev === path ? null : path))
  }, [])

  const handleMenuClose = useCallback(() => {
    setOpenMenu(null)
  }, [])

  const handleMobileToggle = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  const handleMobileClose = useCallback(() => {
    setMobileOpen(false)
  }, [])

  const textClass = isScrolled ? 'text-secondary-600 hover:text-primary-500' : 'text-white/90 hover:text-white'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20'
          : ''
      }`}
    >
      {/* Dark gradient backdrop when on hero */}
      {!isScrolled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(6,14,26,0.7) 0%, rgba(6,14,26,0.3) 60%, transparent 100%)',
          }}
        />
      )}
      <div className="container-padding relative">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="https://www.coin-as.com/wp-content/uploads/sites/2/2022/11/coin-availability-services-logo.svg"
              alt="COIN Availability Services"
              className="h-9 w-auto transition-opacity duration-300 group-hover:opacity-80"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className={`nav-link px-4 py-2 font-medium transition-colors duration-200 block ${textClass}`}>
              Home
            </Link>
            {navItems
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const label = getLocalizedField(item.label, locale)
                const hasChildren = item.children && item.children.length > 0

                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => hasChildren && handleMenuOpen(item.path)}
                    onMouseLeave={handleMenuClose}
                  >
                    {hasChildren ? (
                      <button
                        className={`nav-link flex items-center gap-1 px-4 py-2 font-medium transition-colors duration-200 ${textClass}`}
                        onClick={() => handleMenuOpen(item.path)}
                        type="button"
                      >
                        {label || 'Menu'}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            openMenu === item.path ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.path}
                        className={`nav-link px-4 py-2 font-medium transition-colors duration-200 block ${textClass}`}
                      >
                        {label || 'Link'}
                      </Link>
                    )}

                    {hasChildren && item.children && (
                      <MegaMenu
                        children={item.children}
                        isOpen={openMenu === item.path}
                        onClose={handleMenuClose}
                      />
                    )}
                  </div>
                )
              })}

            {/* Search */}
            <button
              type="button"
              className={`p-2 transition-colors ${textClass}`}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 transition-colors ${textClass}`}
            onClick={handleMobileToggle}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            type="button"
          >
            <motion.div
              initial={false}
              animate={{ rotate: mobileOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav navItems={navItems} isOpen={mobileOpen} onClose={handleMobileClose} />
    </header>
  )
}
