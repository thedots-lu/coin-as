'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Search, Upload, Loader2, Trash2 } from 'lucide-react'
import { useEditing } from './EditingContext'
import { uploadFile } from '@/lib/firebase/upload'
import { SeoMeta } from '@/lib/types/page'
import { LocaleString, Locale } from '@/lib/types/locale'

interface Props {
  seo: SeoMeta | undefined
  /** Public-facing path for the canonical preview line ("https://…/path"). */
  publicPath: string
  onClose: () => void
}

const EMPTY_LOCALE: LocaleString = { en: '', fr: '', nl: '' }
const LOCALES: Locale[] = ['en', 'fr', 'nl']
const RECOMMENDED_TITLE = 60
const RECOMMENDED_DESC = 160
const PUBLIC_BASE_URL = 'https://coin-bc.com'

export default function SeoSettingsDrawer({ seo, publicPath, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const ctx = useEditing()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  if (!ctx) return null

  const metaTitle = seo?.metaTitle ?? EMPTY_LOCALE
  const metaDescription = seo?.metaDescription ?? EMPTY_LOCALE
  const ogImage = seo?.ogImage ?? ''
  const locale = ctx.activeLocale

  const ensureSeo = () => {
    if (seo) return
    ctx.updateAt('seo', {
      metaTitle: { ...EMPTY_LOCALE },
      metaDescription: { ...EMPTY_LOCALE },
      ogImage: null,
    } satisfies SeoMeta)
  }

  const onTitleChange = (value: string) => {
    ensureSeo()
    ctx.updateAt(`seo.metaTitle.${locale}`, value)
  }

  const onDescriptionChange = (value: string) => {
    ensureSeo()
    ctx.updateAt(`seo.metaDescription.${locale}`, value)
  }

  const onOgImageChange = (value: string) => {
    ensureSeo()
    ctx.updateAt('seo.ogImage', value.trim() === '' ? null : value.trim())
  }

  const onOgImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const storagePath = `${ctx.storageBasePath}/seo-og-${Date.now()}.${ext}`
      const url = await uploadFile(file, storagePath, setUploadProgress)
      ensureSeo()
      ctx.updateAt('seo.ogImage', url)
    } catch (err) {
      console.error('OG image upload failed:', err)
      setUploadError('Upload failed')
    } finally {
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const clearOgImage = () => {
    ensureSeo()
    ctx.updateAt('seo.ogImage', null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const titleValue = metaTitle[locale] ?? ''
  const descriptionValue = metaDescription[locale] ?? ''
  const titleLen = titleValue.length
  const descLen = descriptionValue.length

  const previewUrl = `${PUBLIC_BASE_URL}${publicPath}`
  const previewTitle = titleValue.trim() || '— add a meta title —'
  const previewDesc =
    descriptionValue.trim() || '— add a meta description —'

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white shadow-2xl z-50 flex flex-col">
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">SEO settings</h2>
              <p className="text-xs text-gray-500">Title, description and OG image used by search engines and social shares.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </header>

        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">Editing locale</span>
          <div className="inline-flex items-center gap-1 bg-white rounded-md p-0.5 border border-gray-200">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => ctx.setActiveLocale(loc)}
                className={`px-2.5 py-1 text-xs font-semibold uppercase rounded transition-colors ${
                  locale === loc
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Meta title</label>
              <span
                className={`text-[11px] tabular-nums ${
                  titleLen > RECOMMENDED_TITLE ? 'text-amber-600' : 'text-gray-400'
                }`}
              >
                {titleLen} / {RECOMMENDED_TITLE}
              </span>
            </div>
            <input
              type="text"
              value={titleValue}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={`Title (${locale.toUpperCase()})`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Shown as the clickable headline in Google. Aim for ~50–60 characters.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Meta description</label>
              <span
                className={`text-[11px] tabular-nums ${
                  descLen > RECOMMENDED_DESC ? 'text-amber-600' : 'text-gray-400'
                }`}
              >
                {descLen} / {RECOMMENDED_DESC}
              </span>
            </div>
            <textarea
              rows={3}
              value={descriptionValue}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder={`Description (${locale.toUpperCase()})`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Shown under the headline in Google. Aim for ~150–160 characters.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OG image
            </label>
            <p className="text-[11px] text-gray-500 mb-2">
              Image used when the page is shared on Facebook, LinkedIn, Slack, etc. Recommended 1200×630.
            </p>

            <div className="flex items-center justify-center w-full max-w-[280px] aspect-[1.91/1] bg-warm-50 rounded-md overflow-hidden border border-gray-200 mb-2">
              {ogImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ogImage}
                  alt="OG preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">No image</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onOgImageFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProgress !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-60"
              >
                {uploadProgress !== null ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading… {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" /> {ogImage ? 'Replace' : 'Upload'}
                  </>
                )}
              </button>
              {ogImage && (
                <button
                  type="button"
                  onClick={clearOgImage}
                  disabled={uploadProgress !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>

            <input
              type="url"
              value={ogImage ?? ''}
              onChange={(e) => onOgImageChange(e.target.value)}
              placeholder="…or paste a URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {uploadError && (
              <p className="mt-1 text-[11px] text-red-600">{uploadError}</p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Search preview
            </span>
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-[12px] text-gray-600 truncate">{previewUrl}</div>
              <div className="text-[16px] text-[#1a0dab] leading-tight mt-0.5 truncate">
                {previewTitle}
              </div>
              <div className="text-[13px] text-gray-700 leading-snug mt-1 line-clamp-2">
                {previewDesc}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
