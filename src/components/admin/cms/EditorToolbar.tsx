'use client'

import { Locale } from '@/lib/types/locale'
import { ArrowLeft, ExternalLink, Save, Settings } from 'lucide-react'

interface LocaleStat {
  locale: Locale
  filled: number
  total: number
}

interface Props {
  title: string
  activeLocale: Locale
  setActiveLocale: (l: Locale) => void
  localeStats: LocaleStat[]
  isDirty: boolean
  saving: boolean
  onSave: () => void
  onBack: () => void
  previewHref: string
  formEditorHref?: string
}

const LOCALE_LABELS: Record<Locale, string> = { en: 'EN', fr: 'FR', nl: 'NL' }

export default function EditorToolbar({
  title,
  activeLocale,
  setActiveLocale,
  localeStats,
  isDirty,
  saving,
  onSave,
  onBack,
  previewHref,
  formEditorHref,
}: Props) {
  return (
    <div className="sticky top-0 z-40 bg-primary-950 text-white shadow-lg">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Back to pages"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{title}</div>
            <div className="text-[11px] text-white/60">Visual editor (beta)</div>
          </div>
        </div>

        {/* Center: locale switcher */}
        <div className="flex items-center gap-1 bg-white/5 rounded-md p-1">
          {localeStats.map(({ locale, filled, total }) => {
            const pct = total === 0 ? 0 : Math.round((filled / total) * 100)
            const isActive = locale === activeLocale
            return (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveLocale(locale)}
                className={[
                  'px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2',
                  isActive ? 'bg-white text-primary-950' : 'text-white/80 hover:bg-white/10',
                ].join(' ')}
                title={`${filled} / ${total} fields filled`}
              >
                <span>{LOCALE_LABELS[locale]}</span>
                <span
                  className={[
                    'text-[10px] tabular-nums',
                    isActive ? 'text-primary-700' : pct >= 95 ? 'text-emerald-400' : pct > 0 ? 'text-amber-300' : 'text-white/40',
                  ].join(' ')}
                >
                  {pct}%
                </span>
              </button>
            )
          })}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {formEditorHref && (
            <a
              href={formEditorHref}
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white px-2 py-1.5 rounded transition-colors"
              title="Open form-based editor"
            >
              <Settings className="w-3.5 h-3.5" />
              Form editor
            </a>
          )}
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview
          </a>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !isDirty}
            className={[
              'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-colors',
              isDirty && !saving
                ? 'bg-accent-500 hover:bg-accent-600 text-white'
                : 'bg-white/10 text-white/50 cursor-not-allowed',
            ].join(' ')}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </div>
    </div>
  )
}
