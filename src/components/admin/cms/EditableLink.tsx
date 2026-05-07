'use client'

import { MouseEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link2, X } from 'lucide-react'
import { useEditing } from './EditingContext'
import LinkPickerControls, { InternalRoutesDatalist } from './LinkPickerControls'
import {
  CTA_KIND_CHOICES,
  CTA_KIND_LABELS,
  type CtaKindChoice,
} from '@/lib/utils/cta-labels'
import { LocaleString, createEmptyLocaleString } from '@/lib/types/locale'

interface Props {
  path: string
  value: string | null | undefined
  /** Optional small label shown next to the trigger (e.g. "Primary CTA"). */
  label?: string
  /**
   * Optional CTA-label-kind controls. When all four props are provided,
   * the popover also exposes a "Label" picker (auto / typed kinds /
   * custom). Selecting `custom` reveals a single-locale text input bound
   * to the active editing locale. URL, kind and custom label are
   * committed atomically on Save.
   */
  ctaKindPath?: string
  ctaKind?: CtaKindChoice
  ctaLabelPath?: string
  ctaCustomLabel?: LocaleString
}

const POPOVER_WIDTH = 384 // w-96
const POPOVER_MARGIN = 16
const POPOVER_HEIGHT_ESTIMATE = 380

/**
 * Edit-mode-only inline link picker. Renders nothing on the public site.
 * In edit mode renders a small trigger ("🔗 Edit link") that opens an
 * inline popover wrapping LinkPickerControls plus optional CTA-label
 * controls and Save / Cancel.
 *
 * The popover is rendered via a portal to document.body so it escapes any
 * `overflow: hidden` ancestor (e.g. the hero carousel).
 */
export default function EditableLink({
  path,
  value,
  label,
  ctaKindPath,
  ctaKind,
  ctaLabelPath,
  ctaCustomLabel,
}: Props) {
  const ctx = useEditing()
  const activeLocale = ctx?.activeLocale ?? 'en'
  const ctaEnabled = !!ctaKindPath && !!ctaLabelPath

  const [open, setOpen] = useState(false)
  const [draftUrl, setDraftUrl] = useState(value ?? '')
  const [draftKind, setDraftKind] = useState<CtaKindChoice>(ctaKind ?? 'auto')
  const [draftCustomLabel, setDraftCustomLabel] = useState<string>(
    ctaCustomLabel?.[activeLocale] ?? '',
  )
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftUrl(value ?? '')
  }, [value])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftKind(ctaKind ?? 'auto')
  }, [ctaKind])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftCustomLabel(ctaCustomLabel?.[activeLocale] ?? '')
  }, [ctaCustomLabel, activeLocale])

  useEffect(() => {
    if (!open) return
    const reposition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const left = Math.min(
        rect.left,
        window.innerWidth - POPOVER_WIDTH - POPOVER_MARGIN,
      )
      const spaceBelow = window.innerHeight - rect.bottom
      const top =
        spaceBelow >= POPOVER_HEIGHT_ESTIMATE
          ? rect.bottom + 4
          : Math.max(POPOVER_MARGIN, rect.top - POPOVER_HEIGHT_ESTIMATE - 4)
      setPos({ top, left: Math.max(POPOVER_MARGIN, left) })
    }
    reposition()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

  if (!ctx?.isEditing) return null

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
  }

  const save = () => {
    const trimmedUrl = draftUrl.trim()
    if (trimmedUrl !== (value ?? '')) {
      ctx.updateAt(path, trimmedUrl)
    }
    if (ctaEnabled) {
      const currentKind = ctaKind ?? 'auto'
      if (draftKind !== currentKind) {
        ctx.updateAt(ctaKindPath!, draftKind === 'auto' ? undefined : draftKind)
      }
      if (draftKind === 'custom') {
        const base = ctaCustomLabel ?? createEmptyLocaleString()
        const currentLabel = base[activeLocale] ?? ''
        if (draftCustomLabel !== currentLabel) {
          ctx.updateAt(ctaLabelPath!, { ...base, [activeLocale]: draftCustomLabel })
        }
      }
    }
    setOpen(false)
  }

  const cancel = () => {
    setDraftUrl(value ?? '')
    setDraftKind(ctaKind ?? 'auto')
    setDraftCustomLabel(ctaCustomLabel?.[activeLocale] ?? '')
    setOpen(false)
  }

  const display = value && value.trim().length > 0 ? value : '(no link)'

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium bg-white/95 hover:bg-white text-gray-700 shadow-sm border border-gray-200 max-w-full"
        title="Edit link"
      >
        <Link2 className="w-3 h-3 shrink-0" />
        <span className="truncate">
          {label ? `${label}: ` : ''}
          {display}
        </span>
      </button>

      {open && pos && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[100] w-96 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-3 shadow-xl text-gray-900"
            style={{ top: pos.top, left: pos.left }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                save()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                cancel()
              }
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">
                {label ? `Edit ${label}` : 'Edit link'}
              </span>
              <button
                type="button"
                onClick={cancel}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <LinkPickerControls
              value={draftUrl}
              onChange={setDraftUrl}
              autoFocus
              inputRef={inputRef}
            />

            {ctaEnabled && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Label
                </label>
                <select
                  value={draftKind}
                  onChange={(e) => setDraftKind(e.target.value as CtaKindChoice)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {CTA_KIND_CHOICES.map((c) => (
                    <option key={c} value={c}>
                      {CTA_KIND_LABELS[c]}
                    </option>
                  ))}
                </select>
                {draftKind === 'custom' && (
                  <input
                    type="text"
                    value={draftCustomLabel}
                    onChange={(e) => setDraftCustomLabel(e.target.value)}
                    placeholder={`Custom label (${activeLocale.toUpperCase()})`}
                    className="mt-2 w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                )}
              </div>
            )}

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancel}
                className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="px-3 py-1 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded"
              >
                Save
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

export { InternalRoutesDatalist }
