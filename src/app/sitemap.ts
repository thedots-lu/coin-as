import { MetadataRoute } from 'next'
import { getPublishedServices } from '@/lib/firestore/services'
import { getPublishedNews } from '@/lib/firestore/news'
import { getPublishedArticles } from '@/lib/firestore/articles'

const BASE_URL = 'https://coin-bc.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/locations`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/knowledge-hub`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/knowledge-hub/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/partners`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.7 },
    { url: `${BASE_URL}/legal-notice`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE_URL}/cookies-policy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  const [services, news, articles] = await Promise.all([
    getPublishedServices(),
    getPublishedNews(),
    getPublishedArticles(),
  ])

  const servicePages = services
    .filter(s => s.slug !== 'overview')
    .map(s => ({
      url: `${BASE_URL}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  const newsPages = news.map(n => ({
    url: `${BASE_URL}/news/${typeof n.slug === 'object' ? n.slug.en : n.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const articlePages = articles.map(a => ({
    url: `${BASE_URL}/knowledge-hub/${typeof a.slug === 'object' ? a.slug.en : a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...servicePages, ...newsPages, ...articlePages]
}
