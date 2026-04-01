import Link from 'next/link'
import { Linkedin, Phone, Mail, ArrowUpRight } from 'lucide-react'
import { getLocalizedField } from '@/lib/locale'
import type { FooterNavigation } from '@/lib/types/navigation'
import type { SiteConfig } from '@/lib/types/site-config'

interface FooterProps {
  footerNav: FooterNavigation | null
  siteConfig: SiteConfig | null
}

export default function Footer({ footerNav, siteConfig }: FooterProps) {
  const locale = 'en'
  const currentYear = new Date().getFullYear()

  const description = getLocalizedField(siteConfig?.footerDescription, locale)
  const copyright = getLocalizedField(siteConfig?.copyright, locale)

  return (
    <footer className="relative text-white overflow-hidden" style={{ background: 'var(--color-surface-darkest)' }}>
      {/* Subtle geometric pattern overlay -- editorial texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(90deg, white 1px, transparent 1px),
            linear-gradient(180deg, white 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Top accent line -- thin amber rule */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent-400 to-transparent" />

      {/* Main content */}
      <div className="relative container-padding pt-14 pb-10">
        {/* Brand row: Logo + description */}
        <div className="mb-10">
          <Link href="/" className="inline-block mb-5 group">
            <img
              src="/images/coin/coin-logo-negative.png"
              alt="COIN Availability Services"
              className="h-10 w-auto transition-opacity duration-300 group-hover:opacity-80"
            />
          </Link>

          {description && (
            <p className="text-secondary-300 text-base leading-relaxed max-w-lg">
              {description}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-secondary-700/60 mb-10" />

        {/* Navigation columns + Contact info side by side */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {footerNav?.columns?.map((column, index) => {
            const heading = getLocalizedField(column.heading, locale)
            return (
              <div key={index}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary-400 mb-5 font-display">
                  {heading || `Column ${index + 1}`}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => {
                    const linkLabel = getLocalizedField(link.label, locale)
                    return (
                      <li key={linkIndex}>
                        <Link
                          href={link.path}
                          className="text-secondary-200 text-[15px] inline-block transition-all duration-300 hover:text-white hover:translate-x-1"
                        >
                          {linkLabel || 'Link'}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}

          {/* Contact info -- 5th column, right of nav */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary-400 mb-5 font-display">
              Contact
            </h3>
            <div className="space-y-3">
              {siteConfig?.phoneNL && (
                <a
                  href={`tel:${siteConfig.phoneNL.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-secondary-200 text-[14px] transition-colors duration-300 hover:text-accent-400"
                >
                  <Phone className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
                  <span>
                    <span className="text-secondary-500 text-xs uppercase tracking-wider mr-1">NL</span>
                    {siteConfig.phoneNL}
                  </span>
                </a>
              )}
              {siteConfig?.phoneLU && (
                <a
                  href={`tel:${siteConfig.phoneLU.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-secondary-200 text-[14px] transition-colors duration-300 hover:text-accent-400"
                >
                  <Phone className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
                  <span>
                    <span className="text-secondary-500 text-xs uppercase tracking-wider mr-1">LU</span>
                    {siteConfig.phoneLU}
                  </span>
                </a>
              )}
              {siteConfig?.contactEmail && (
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="flex items-center gap-2 text-secondary-200 text-[14px] transition-colors duration-300 hover:text-accent-400"
                >
                  <Mail className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
                  <span>{siteConfig.contactEmail}</span>
                </a>
              )}
              {siteConfig?.linkedinUrl && (
                <a
                  href={siteConfig.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-secondary-200 text-[14px] transition-colors duration-300 hover:text-accent-400"
                >
                  <Linkedin className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="h-3 w-3 text-secondary-500" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-secondary-700/50">
        {/* Subtle inner glow on border */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-secondary-500/40 to-transparent" />

        <div className="container-padding py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-secondary-500 text-xs tracking-wide">
              {copyright || `${currentYear} COIN. All rights reserved.`}
            </p>

            <div className="flex items-center gap-1 text-xs">
              <Link
                href="/legal-notice"
                className="text-secondary-500 px-3 py-1 rounded transition-colors duration-200 hover:text-secondary-200 hover:bg-secondary-800"
              >
                Legal Notice
              </Link>
              <span className="text-secondary-700">|</span>
              <Link
                href="/privacy-policy"
                className="text-secondary-500 px-3 py-1 rounded transition-colors duration-200 hover:text-secondary-200 hover:bg-secondary-800"
              >
                Privacy Policy
              </Link>
              <span className="text-secondary-700">|</span>
              <Link
                href="/cookies-policy"
                className="text-secondary-500 px-3 py-1 rounded transition-colors duration-200 hover:text-secondary-200 hover:bg-secondary-800"
              >
                Cookies Policy
              </Link>
              <span className="text-secondary-700 ml-2">|</span>
              <Link
                href="/admin"
                className="text-secondary-600 px-3 py-1 rounded transition-colors duration-200 hover:text-secondary-400 hover:bg-secondary-800"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
