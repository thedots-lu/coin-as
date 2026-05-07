import { MetadataRoute } from 'next'

// AI crawlers we want to keep off the site. Search engines (Googlebot,
// Bingbot, DuckDuckBot, etc.) stay allowed under the wildcard rule.
//
// Distinct buckets are merged here for simplicity:
//   - training-data crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended…)
//   - on-demand browsing agents fired during user queries (ChatGPT-User,
//     Perplexity-User, Claude-Web…)
//
// Note `Google-Extended` and `Applebot-Extended` only opt out of AI
// training; the canonical search bots (`Googlebot`, `Applebot`) are NOT
// listed and continue to crawl normally.
const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'CCBot',
  'PerplexityBot',
  'Perplexity-User',
  'Bytespider',
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'FacebookBot',
  'cohere-ai',
  'cohere-training-data-crawler',
  'Diffbot',
  'AI2Bot',
  'AI2Bot-Dolma',
  'DuckAssistBot',
  'ImagesiftBot',
  'Omgilibot',
  'Omgili',
  'Timpibot',
  'YouBot',
  'iaskspider/2.0',
  'ISSCyberRiskCrawler',
  'PanguBot',
  'Kangaroo Bot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Search engines and everything else: allowed (admin/api blocked).
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      // AI bots: full opt-out.
      {
        userAgent: AI_BOTS,
        disallow: ['/'],
      },
    ],
    sitemap: 'https://coin-bc.com/sitemap.xml',
  }
}
