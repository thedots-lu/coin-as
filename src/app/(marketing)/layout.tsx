import { getMainNavigation, getFooterNavigation } from '@/lib/firestore/navigation'
import { getSiteConfig } from '@/lib/firestore/site-config'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/layout/ScrollToTop'
import CookieBanner from '@/components/layout/CookieBanner'
import ConsentScripts from '@/components/layout/ConsentScripts'
import EventBanner from '@/components/layout/EventBanner'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? ''
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? ''

export const revalidate = 300

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mainNav, footerNav, siteConfig] = await Promise.all([
    getMainNavigation(),
    getFooterNavigation(),
    getSiteConfig(),
  ])

  return (
    <>
      {/* Analytics — loaded client-side only after cookie consent */}
      <ConsentScripts gtmId={GTM_ID} clarityId={CLARITY_ID} />

      <Header navItems={mainNav?.items ?? []} siteConfig={siteConfig} />

      <main className="min-h-screen pt-20">
        <EventBanner
          message="Join us at the COIN AS Business Continuity Summit — Amsterdam, June 2026"
          linkText="Register now"
          linkHref="/news"
        />
        {children}
      </main>
      <Footer footerNav={footerNav} siteConfig={siteConfig} />
      <ScrollToTop />
      <CookieBanner />
    </>
  )
}
