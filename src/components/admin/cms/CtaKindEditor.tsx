'use client'

import { useEffect, useState } from 'react'
import { Tag } from 'lucide-react'
import { useEditing } from './EditingContext'
import {
  CTA_KIND_CHOICES,
  CTA_KIND_LABELS,
  type CtaKindChoice,
} from '@/lib/utils/cta-labels'
import { LocaleString, createEmptyLocaleString } from '@/lib/types/locale'

interface Props {
  kindPath: string
  kind: CtaKindChoice | undefined
  /** Path to the LocaleString that holds the editor-provided label,
   *  used only when kind === 'custom'. */
  labelPath: string
  customLabel: LocaleString | undefined
}

/**
 * Inline admin control to pick a CTA's "kind" (URL auto / explicit type /
 * custom). When `custom` is selected, also surfaces a single-locale text
 * input bound to the active editing locale so editors can type their own
 * label without leaving the page.
 */
export default function CtaKindEditor({
  kindPath,
  kind,
  labelPath,
  customLabel,
}: Props) {
  const ctx = useEditing()
  const activeLocale = ctx?.activeLocale ?? 'en'
  const currentLabel = customLabel?.[activeLocale] ?? ''
  const [draft, setDraft] = useState<string>(currentLabel)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(currentLabel)
  }, [currentLabel, activeLocale])

  if (!ctx?.isEditing) return null

  const selected: CtaKindChoice = kind ?? 'auto'

  const handleKindChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as CtaKindChoice
    ctx.updateAt(kindPath, next === 'auto' ? undefined : next)
    if (next === 'custom' && !customLabel) {
      ctx.updateAt(labelPath, createEmptyLocaleString())
    }
  }

  const commitLabel = () => {
    if (draft === currentLabel) return
    const base = customLabel ?? createEmptyLocaleString()
    ctx.updateAt(labelPath, { ...base, [activeLocale]: draft })
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium bg-white/95 text-gray-700 shadow-sm border border-gray-200">
      <Tag className="w-3 h-3 shrink-0 text-gray-500" />
      <select
        value={selected}
        onChange={handleKindChange}
        className="bg-transparent text-[11px] font-medium focus:outline-none"
        title="CTA label kind"
      >
        {CTA_KIND_CHOICES.map((c) => (
          <option key={c} value={c}>
            {CTA_KIND_LABELS[c]}
          </option>
        ))}
      </select>
      {selected === 'custom' && (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          placeholder={`Label (${activeLocale})`}
          className="bg-transparent border-l border-gray-200 pl-1.5 ml-0.5 text-[11px] focus:outline-none w-32"
        />
      )}
    </span>
  )
}
