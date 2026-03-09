import Link from 'next/link'
import { Shield, Linkedin, Phone, Mail } from 'lucide-react'
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
    <footer className="bg-gradient-to-b from-secondary-900 to-secondary-800 text-white">
      <div className="container-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Company Info Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Shield className="h-8 w-8 text-primary-400 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-2xl font-bold font-[family-name:var(--font-poppins)]">
                {siteConfig?.siteName ?? 'COIN'}
              </span>
            </Link>

            {description && (
              <p className="text-secondary-300 leading-relaxed mb-6 max-w-sm">
                {description}
              </p>
            )}

            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              {siteConfig?.phoneNL && (
                <a
                  href={`tel:${siteConfig.phoneNL.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-secondary-300 hover:text-primary-400 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>NL: {siteConfig.phoneNL}</span>
                </a>
              )}
              {siteConfig?.phoneLU && (
                <a
                  href={`tel:${siteConfig.phoneLU.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-secondary-300 hover:text-primary-400 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>LU: {siteConfig.phoneLU}</span>
                </a>
              )}
              {siteConfig?.contactEmail && (
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="flex items-center gap-2 text-secondary-300 hover:text-primary-400 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{siteConfig.contactEmail}</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            {siteConfig?.linkedinUrl && (
              <a
                href={siteConfig.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-secondary-300 hover:text-primary-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>

          {/* Navigation Columns */}
          {footerNav?.columns?.map((column, index) => {
            const heading = getLocalizedField(column.heading, locale)
            return (
              <div key={index}>
                <h3 className="text-white font-semibold text-lg mb-4 font-[family-name:var(--font-poppins)]">
                  {heading || `Column ${index + 1}`}
                </h3>
                <ul className="space-y-2.5">
                  {column.links.map((link, linkIndex) => {
                    const linkLabel = getLocalizedField(link.label, locale)
                    return (
                      <li key={linkIndex}>
                        <Link
                          href={link.path}
                          className="text-secondary-300 hover:text-primary-400 transition-colors duration-200"
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
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-secondary-700">
        <div className="container-padding py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-secondary-400 text-sm">
              {copyright || `(c) ${currentYear} COIN. All rights reserved.`}
            </p>

            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/legal-notice"
                className="text-secondary-400 hover:text-primary-400 transition-colors"
              >
                Legal Notice
              </Link>
              <Link
                href="/privacy-policy"
                className="text-secondary-400 hover:text-primary-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookies-policy"
                className="text-secondary-400 hover:text-primary-400 transition-colors"
              >
                Cookies Policy
              </Link>
              <Link
                href="/admin"
                className="text-secondary-500 hover:text-secondary-400 transition-colors text-xs"
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
