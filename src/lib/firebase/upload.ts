import { auth } from './config'

export type UploadProgress = (percent: number) => void

/**
 * Best-effort delete of an uploaded asset by URL. URLs that don't belong to
 * our R2 bucket are silently ignored server-side (no-op for external/legacy).
 * Errors are logged but never thrown — caller continues regardless.
 */
export async function deleteFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.trim()) return
  try {
    const user = auth.currentUser
    if (!user) return
    const token = await user.getIdToken()
    const res = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.warn('[deleteFile] non-OK response', res.status, body)
    }
  } catch (err) {
    console.warn('[deleteFile] failed', err)
  }
}

/**
 * Upload `file` via the /api/upload route (backed by Cloudflare R2).
 * `storagePath` is the full object key (caller controls naming).
 * Authenticates with the current admin's Firebase ID token.
 */
export async function uploadFile(
  file: File,
  storagePath: string,
  onProgress?: UploadProgress,
): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  const token = await user.getIdToken()

  const form = new FormData()
  form.append('file', file)
  form.append('key', storagePath)

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload')
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      })
    }
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const body = JSON.parse(xhr.responseText) as { url?: string; error?: string }
          if (body.url) resolve(body.url)
          else reject(new Error(body.error || 'Upload failed.'))
        } catch {
          reject(new Error('Invalid server response.'))
        }
      } else {
        let message = `HTTP ${xhr.status}`
        try {
          const body = JSON.parse(xhr.responseText) as { error?: string }
          if (body.error) message = body.error
        } catch { /* keep default */ }
        reject(new Error(message))
      }
    })
    xhr.addEventListener('error', () => reject(new Error('Network error.')))
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled.')))
    xhr.send(form)
  })
}
