/**
 * Compact logo marquee — "Trusted by" strip for the landing page.
 * Pure presentational. Data is fetched at the page level and passed in via
 * `logos`; falls back to defaults when none provided. Kept synchronous so it
 * can be rendered from both server and client trees (visual CMS editor).
 */

import { DEFAULT_CUSTOMER_LOGOS } from '@/lib/defaults/customer-logos'
import LogoMarquee from './LogoMarquee'

interface Props {
  logos?: Array<{ url: string; name: string }>
}

export default function TrustedByMarquee({ logos }: Props) {
  const resolved =
    logos && logos.length > 0
      ? logos
      : DEFAULT_CUSTOMER_LOGOS.map((l) => ({ url: l.imageUrl, name: l.name }))

  if (resolved.length === 0) return null

  return (
    <section className="py-14 bg-warm-50 overflow-hidden">
      <div className="container-padding mb-10 text-center">
        <div className="w-12 h-1 bg-accent-500 rounded-full mx-auto mb-5" />
        <h2 className="text-2xl md:text-3xl font-bold text-secondary-800 font-display">
          Trusted by leading organisations across the BeNeLux
        </h2>
        <p className="mt-5 max-w-3xl mx-auto text-secondary-600 leading-relaxed">
          COIN has been the first and last line of defence for dozens of organizations with critical operations and help them cope with facility outages, telecom or power cuts, pandemics, social events and ransomware.
        </p>
      </div>

      <LogoMarquee logos={resolved} />
    </section>
  )
}
