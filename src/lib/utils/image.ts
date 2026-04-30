/**
 * Returns true if the given URL points to an AVIF file.
 *
 * Next.js 16's image optimizer (`/_next/image`) reads the major brand of
 * ISO-BMFF inputs to detect AVIF and only accepts the `avif` brand. Files
 * encoded with `avis` (AVIF Sequence) or other compatible brands are
 * rejected with 400 even when the file is a perfectly valid still image.
 *
 * Browsers don't have this limitation — when we set `unoptimized` on
 * `<Image>` for AVIF sources, the browser fetches the original directly
 * from R2 and renders it. We lose Next's responsive transforms on AVIFs but
 * keep them for every other format.
 */
export function isAvifUrl(src: string | null | undefined): boolean {
  if (typeof src !== 'string') return false
  const path = src.split('?')[0].split('#')[0].toLowerCase()
  return path.endsWith('.avif')
}
