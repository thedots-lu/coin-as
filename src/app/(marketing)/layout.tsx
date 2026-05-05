import { getMainNavigation, getFooterNavigation } from '@/lib/firestore/navigation'
import { getSiteConfig } from '@/lib/firestore/site-config'
import { getPublishedServices } from '@/lib/firestore/services'
import { NavItem, NavChild } from '@/lib/types/navigation'
import { ServiceDocument } from '@/lib/types/service'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/layout/ScrollToTop'
import CookieBanner from '@/components/layout/CookieBanner'
import ConsentScripts from '@/components/layout/ConsentScripts'
import EventBanner from '@/components/layout/EventBanner'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? ''
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? ''

export const revalidate = 300

// The Services submenu is derived from the `services` collection
// (published only) so admin publish/unpublish reflects in the nav
// without manual sync. Overview is pinned first.
function buildServicesChildren(services: ServiceDocument[]): NavChild[] {
  const overviewLabel = { en: 'Overview of Services', fr: '', nl: '' }
  const overview: NavChild = { label: overviewLabel, path: '/services', order: 0 }
  const items = services
    .filter((s) => (s.slug ?? s.id) !== 'overview')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map<NavChild>((s, i) => ({
      // Card title overrides service title when present (kept short for the menu).
      label: s.card?.title && s.card.title.en?.trim() ? s.card.title : s.title,
      path: `/services/${s.slug ?? s.id}`,
      order: i + 1,
    }))
  return [overview, ...items]
}

function injectServicesChildren(items: NavItem[], children: NavChild[]): NavItem[] {
  return items.map((item) => (item.path === '/services' ? { ...item, children } : item))
}

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mainNav, footerNav, siteConfig, services] = await Promise.all([
    getMainNavigation(),
    getFooterNavigation(),
    getSiteConfig(),
    getPublishedServices(),
  ])

  const servicesChildren = buildServicesChildren(services)
  const navItems = injectServicesChildren(mainNav?.items ?? [], servicesChildren)

  return (
    <>
      {/* Analytics — loaded client-side only after cookie consent */}
      <ConsentScripts gtmId={GTM_ID} clarityId={CLARITY_ID} />

      <Header navItems={navItems} siteConfig={siteConfig} />

      <main className="min-h-screen pt-20">
        {siteConfig?.newsletterUrl && (
          <EventBanner
            message="Stay informed on business continuity & cyber resilience"
            linkText="Subscribe to our newsletter"
            linkHref={siteConfig.newsletterUrl}
          />
        )}
        {children}
      </main>
      <Footer footerNav={footerNav} siteConfig={siteConfig} />
      <ScrollToTop />
      <CookieBanner />
    </>
  )
}
