/**
 * Browser-side image compression. Resizes a bitmap image so its longest side
 * fits within `maxDimension`, re-encodes as WebP, and returns a new File with
 * a `.webp` extension. Used before /api/upload so a 12 MB phone photo doesn't
 * hit Netlify's 6 MB function payload limit.
 *
 * Pass through unchanged for non-bitmap inputs (PDF, SVG, GIF, AVIF) and for
 * already-small images that wouldn't benefit from re-encoding.
 */

const COMPRESSIBLE_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

export interface CompressOptions {
  /** Longest-side cap in pixels. */
  maxDimension?: number
  /** WebP quality (0–1). */
  quality?: number
  /** Skip compression entirely if the source is below this byte threshold. */
  skipBelowBytes?: number
}

export async function compressImage(
  file: File,
  opts: CompressOptions = {},
): Promise<File> {
  const maxDimension = opts.maxDimension ?? 1400
  const quality = opts.quality ?? 0.85
  const skipBelowBytes = opts.skipBelowBytes ?? 200 * 1024

  if (!COMPRESSIBLE_MIME.has(file.type)) return file
  if (file.size < skipBelowBytes) return file

  const bitmap = await loadBitmap(file)
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxDimension)
    if (width === bitmap.width && height === bitmap.height && file.type === 'image/webp') {
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await canvasToBlob(canvas, 'image/webp', quality)
    if (!blob || blob.size >= file.size) return file

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
    return new File([blob], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } finally {
    if ('close' in bitmap) bitmap.close()
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file)
  }
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Image decode failed'))
      el.src = url
    })
    return img as unknown as ImageBitmap
  } finally {
    URL.revokeObjectURL(url)
  }
}

function fitWithin(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h }
  const scale = w >= h ? max / w : max / h
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality))
}
