'use client'

import { useState, useRef } from 'react'
import { auth } from '@/lib/firebase/config'
import { Upload, X, ImageIcon, Link as LinkIcon } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  storagePath: string
  label?: string
}

export default function ImageUpload({ value, onChange, storagePath, label }: ImageUploadProps) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setError(null)
    setProgress(0)

    try {
      const user = auth.currentUser
      if (!user) {
        setError('Not authenticated.')
        setProgress(null)
        return
      }
      const token = await user.getIdToken()

      const form = new FormData()
      form.append('file', file)
      form.append('path', storagePath)

      const url: string = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload')
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        })
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

      onChange(url)
    } catch (err) {
      console.error('[ImageUpload] upload failed', err)
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setProgress(null)
    }
  }

  const clearImage = () => {
    onChange('')
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}

      {value ? (
        <div className="border border-gray-300 rounded-md p-3 space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="max-h-48 rounded object-contain bg-gray-50 mx-auto"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-500 truncate flex-1">{value}</span>
            <button
              type="button"
              onClick={clearImage}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">No image selected</p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              Use URL
            </button>
          </div>
          {showUrlInput && (
            <input
              type="url"
              placeholder="https://..."
              onBlur={(e) => {
                if (e.target.value.trim()) onChange(e.target.value.trim())
                setShowUrlInput(false)
              }}
              autoFocus
              className="mt-3 w-full max-w-md mx-auto px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          )}
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {progress !== null && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
