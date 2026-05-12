import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getPublishedSites, getSiteBySlug, siteSlug } from '@/lib/firestore/sites'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { createEmptyLocaleString } from '@/lib/types/locale'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'
import SiteIntroCards from '@/components/sections/SiteIntroCards'
import RelatedSitesCarousel from '@/components/sections/RelatedSitesCarousel'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const site = await getSiteBySlug(slug)
  if (!site) return { title: 'Location not found' }
  const title = site.name ?? createEmptyLocaleString()
  return generatePageMetadata(undefined, title, { path: `/locations/${slug}` })
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [site, allSites] = await Promise.all([
    getSiteBySlug(slug),
    getPublishedSites(),
  ])
  if (!site) notFound()

  const relatedSites = allSites.filter((s) => siteSlug(s) !== slug)

  return (
    <>
      <SiteIntroCards site={site} locale="en" />
      {site.sections && site.sections.length > 0 && (
        <PageSectionRenderer sections={site.sections} />
      )}
      <RelatedSitesCarousel sites={relatedSites} />
    </>
  )
}
