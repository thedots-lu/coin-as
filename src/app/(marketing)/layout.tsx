import { getMainNavigation, getFooterNavigation } from '@/lib/firestore/navigation'
import { getSiteConfig } from '@/lib/firestore/site-config'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/layout/ScrollToTop'
import CookieBanner from '@/components/layout/CookieBanner'

export const revalidate = 300

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mainNav, footerNav, siteConfig] = await Promise.all([
    getMainNavigation(),
    getFooterNavigation(),
    getSiteConfig(),
  ])

  return (
    <>
      <Header navItems={mainNav?.items ?? []} siteConfig={siteConfig} />
      <main className="min-h-screen pt-20">{children}</main>
      <Footer footerNav={footerNav} siteConfig={siteConfig} />
      <ScrollToTop />
      <CookieBanner />
    </>
  )
}
