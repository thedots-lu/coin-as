import { collection, getDocs } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { YoutubeVideoDoc } from '../types/youtube-video'
import { serializeFirestoreData } from './serialize'
import type { YoutubeVideo } from '../youtube'

/**
 * Fetch the editor-curated YouTube videos for the public /resources/videos
 * page. Returns objects shaped like `YoutubeVideo` (the existing interface
 * used by the RSS helper) so the page component is unaware of the source
 * change.
 */
export async function getCuratedVideos(): Promise<YoutubeVideo[]> {
  try {
    const snapshot = await getDocs(collection(db, 'youtube_videos'))
    const docs = snapshot.docs.map((d) =>
      serializeFirestoreData<YoutubeVideoDoc>({ id: d.id, ...d.data() }),
    )
    return docs
      .filter((d) => d.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((d) => ({
        id: d.videoId,
        title: d.title,
        publishedAt: d.publishedAt ?? '',
        thumbnail: d.thumbnail || `https://i.ytimg.com/vi/${d.videoId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${d.videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${d.videoId}`,
      }))
  } catch (err) {
    console.error('Error fetching curated youtube videos:', err)
    return []
  }
}
