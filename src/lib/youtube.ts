/**
 * Fetch videos from the COIN YouTube channel via the public RSS feed.
 * No API key required. Used at build/revalidate time (Server Components).
 */

export const COIN_YOUTUBE_CHANNEL_ID = 'UCfjAuPHfLlPfDtFEN_H5CPA'
export const COIN_YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@coinbusinesscontinuity'

export interface YoutubeVideo {
  id: string
  title: string
  publishedAt: string
  thumbnail: string
  embedUrl: string
  watchUrl: string
}

/**
 * Fetch all videos from the COIN YouTube channel RSS feed.
 * RSS feeds return the 15 most recent videos.
 */
export async function getCoinYoutubeVideos(): Promise<YoutubeVideo[]> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${COIN_YOUTUBE_CHANNEL_ID}`

    // Next.js fetch with revalidation
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 }, // Refresh hourly
    })

    if (!response.ok) {
      console.error(`YouTube RSS fetch failed: ${response.status}`)
      return []
    }

    const xml = await response.text()
    return parseYoutubeRss(xml)
  } catch (err) {
    console.error('Error fetching YouTube videos:', err)
    return []
  }
}

/**
 * Parse YouTube RSS XML into structured video objects.
 * Simple regex parser: avoids heavy XML dependencies for build size.
 */
function parseYoutubeRss(xml: string): YoutubeVideo[] {
  const videos: YoutubeVideo[] = []

  // Match each <entry>...</entry> block
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let entryMatch

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entry = entryMatch[1]

    const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/)
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/)
    const thumbnailMatch = entry.match(/<media:thumbnail url="([^"]+)"/)

    if (!idMatch || !titleMatch) continue

    const id = idMatch[1]
    videos.push({
      id,
      title: decodeXmlEntities(titleMatch[1]),
      publishedAt: publishedMatch?.[1] ?? '',
      thumbnail: thumbnailMatch?.[1] ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
    })
  }

  return videos
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
}
