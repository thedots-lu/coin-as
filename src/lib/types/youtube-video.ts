import { Timestamp } from 'firebase/firestore/lite'

/**
 * One curated YouTube video shown on /resources/videos. Distinct from
 * the `youtube.ts` RSS helper, which used to surface every video on
 * the channel. The admin curates this list via /admin/videos.
 */
export interface YoutubeVideoDoc {
  id: string
  /** 11-character YouTube video id (the v= param). */
  videoId: string
  /** Editor-overridable title; pre-filled from oEmbed at add time. */
  title: string
  /** Thumbnail URL; pre-filled from oEmbed, falls back to i.ytimg.com. */
  thumbnail: string
  /** Optional ISO date the editor can fill in to surface a "Jan 2024"
   *  style stamp on the public card. oEmbed doesn't expose the upload
   *  date, so we keep this manual. */
  publishedAt?: string | null
  order: number
  visible: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}
