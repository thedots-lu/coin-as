'use client'

import Image, { ImageProps } from 'next/image'
import { useRef, useState } from 'react'
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { useEditing } from './EditingContext'
import { uploadFile } from '@/lib/firebase/upload'

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  path: string
  src: string | null
  alt: string
}

export default function EditableImage({ path, src, alt, ...rest }: Props) {
  const ctx = useEditing()
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!ctx?.isEditing

  const onPick = () => inputRef.current?.click()

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !ctx) return
    setError(null)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const safeKey = path.replace(/[^a-z0-9]/gi, '_')
      const storagePath = `${ctx.storageBasePath}/${safeKey}-${Date.now()}.${ext}`
      const url = await uploadFile(file, storagePath, setProgress)
      ctx.updateAt(path, url)
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Upload failed')
    } finally {
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  if (!isEditing) {
    if (!src) return null
    return <Image src={src} alt={alt} {...rest} />
  }

  return (
    <>
      {src ? (
        <Image src={src} alt={alt} {...rest} />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500"
          aria-hidden
        >
          <div className="flex flex-col items-center gap-2 text-xs">
            <ImageIcon className="w-8 h-8 opacity-60" />
            <span>No image — click Upload</span>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onPick}
        disabled={progress !== null}
        className="cms-image-action absolute top-2 right-2 z-50 bg-white/95 hover:bg-white text-gray-900 text-xs px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 font-medium disabled:opacity-70"
      >
        {progress !== null ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {progress}%
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" />
            {src ? 'Replace' : 'Upload'}
          </>
        )}
      </button>
      {error && (
        <div className="absolute top-12 right-2 z-50 bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
          {error}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
    </>
  )
}
