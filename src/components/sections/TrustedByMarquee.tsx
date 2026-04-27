/**
 * Compact logo marquee — "Trusted by" strip for the landing page.
 * Server component: fetches customer logos from Firestore, falls back to defaults
 * when the collection is empty (so the section never renders blank pre-seed).
 * Interactive rendering (auto-scroll, prev/next, drag) is delegated to LogoMarquee.
 */

import { getVisibleCustomerLogos } from '@/lib/firestore/customer-logos'
import { DEFAULT_CUSTOMER_LOGOS } from '@/lib/defaults/customer-logos'
import LogoMarquee from './LogoMarquee'

export default async function TrustedByMarquee() {
  const fromDb = await getVisibleCustomerLogos()
  const logos =
    fromDb.length > 0
      ? fromDb.map((l) => ({ url: l.imageUrl, name: l.name }))
      : DEFAULT_CUSTOMER_LOGOS.map((l) => ({ url: l.imageUrl, name: l.name }))

  if (logos.length === 0) return null

  return (
    <section className="py-14 bg-warm-50 overflow-hidden">
      <div className="container-padding mb-10 text-center">
        <div className="w-12 h-1 bg-accent-500 rounded-full mx-auto mb-5" />
        <h2 className="text-2xl md:text-3xl font-bold text-secondary-800 font-display">
          Trusted by leading organisations across the BeNeLux
        </h2>
      </div>

      <LogoMarquee logos={logos} />
    </section>
  )
}
