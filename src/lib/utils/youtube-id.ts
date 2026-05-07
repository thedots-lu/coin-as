/**
 * Pull the 11-character video id out of a YouTube URL. Handles the
 * common shapes the editor might paste:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 *   ID  (already a bare id)
 */
export function extractYoutubeId(input: string): string | null {
  const trimmed = (input ?? '').trim()
  if (!trimmed) return null
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  return match?.[1] ?? null
}
