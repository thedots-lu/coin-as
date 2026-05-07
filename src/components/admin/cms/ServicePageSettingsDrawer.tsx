'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useEditing } from './EditingContext'
import LinkPickerControls, { InternalRoutesDatalist } from './LinkPickerControls'
import { ServiceCard, ServiceCardAccent } from '@/lib/types/service'
import { LocaleString } from '@/lib/types/locale'
import { FEATURE_ICON_NAMES, resolveFeatureIcon } from '@/lib/icons'
import RichTextEditor from '@/components/admin/RichTextEditor'

interface Props {
  card: ServiceCard | undefined
  articleHref: string | null | undefined
  onClose: () => void
}

const ACCENT_OPTIONS: Array<{ value: ServiceCardAccent; label: string; swatch: string }> = [
  { value: 'primary', label: 'Primary', swatch: 'bg-primary-500' },
  { value: 'accent', label: 'Accent', swatch: 'bg-accent-500' },
  { value: 'red', label: 'Red', swatch: 'bg-coin-red-500' },
  { value: 'primary-dark', label: 'Primary dark', swatch: 'bg-primary-700' },
]

const EMPTY_LOCALE: LocaleString = { en: '', fr: '', nl: '' }

export default function ServicePageSettingsDrawer({ card, articleHref, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const ctx = useEditing()
  if (!ctx) return null

  const title = (card?.title ?? EMPTY_LOCALE) as LocaleString
  const body = (card?.body ?? EMPTY_LOCALE) as LocaleString
  const icon = card?.icon ?? ''
  const accent: ServiceCardAccent = card?.accent ?? 'primary'
  const previewIcon = resolveFeatureIcon(icon)

  // Materialise card object the first time the user touches a field.
  const ensureCard = () => {
    if (!card) {
      ctx.updateAt('card', {
        title: EMPTY_LOCALE,
        body: EMPTY_LOCALE,
        icon: 'Briefcase',
        accent: 'primary',
      } as ServiceCard)
    }
  }

  const onTitleChange = (value: string) => {
    ensureCard()
    ctx.updateAt(`card.title.${ctx.activeLocale}`, value)
  }

  const onBodyChange = (html: string) => {
    ensureCard()
    ctx.updateAt(`card.body.${ctx.activeLocale}`, html)
  }

  const onIconChange = (name: string) => {
    ensureCard()
    ctx.updateAt('card.icon', name)
  }

  const onAccentChange = (value: ServiceCardAccent) => {
    ensureCard()
    ctx.updateAt('card.accent', value)
  }

  const onArticleHrefChange = (value: string) => {
    const trimmed = value.trim()
    ctx.updateAt('articleHref', trimmed === '' ? null : trimmed)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col">
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Page settings</h2>
            <p className="text-xs text-gray-500">Service-level fields outside the page sections.</p>
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

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Service card</h3>
            <p className="text-xs text-gray-500 mb-4">
              Used on the <code className="px-1 py-0.5 rounded bg-gray-100">/services</code>{' '}
              overview, the page banner and the related-services carousel. Leave the title empty to
              fall back to the service title.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    {ctx.activeLocale}
                  </span>
                </div>
                <input
                  type="text"
                  value={title[ctx.activeLocale] ?? ''}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Defaults to the service title"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Body</label>
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    {ctx.activeLocale}
                  </span>
                </div>
                <RichTextEditor
                  value={body[ctx.activeLocale] ?? ''}
                  onChange={(html) => onBodyChange(html)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="flex items-center gap-2">
                  <select
                    value={icon}
                    onChange={(e) => onIconChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  >
                    <option value="">— Select an icon —</option>
                    {FEATURE_ICON_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    {previewIcon
                      ? (() => {
                          const Icon = previewIcon
                          return <Icon className="w-5 h-5 text-gray-600" strokeWidth={2} />
                        })()
                      : <span className="text-xs text-gray-400">—</span>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACCENT_OPTIONS.map((opt) => {
                    const active = opt.value === accent
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onAccentChange(opt.value)}
                        className={[
                          'flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors',
                          active
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <span className={`w-3 h-3 rounded-full ${opt.swatch}`} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related article / case study
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Optional. When set, a &ldquo;Read our article&rdquo; (or &ldquo;Read our
                  case study&rdquo;) CTA appears above the related services carousel.
                  Leave empty to hide it.
                </p>
                <LinkPickerControls
                  value={articleHref ?? ''}
                  onChange={onArticleHrefChange}
                />
                <InternalRoutesDatalist />
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}
