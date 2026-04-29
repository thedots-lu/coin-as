'use client'

import { useEffect, useRef, useState } from 'react'
import { Link2, X } from 'lucide-react'
import { useEditing } from './EditingContext'
import LinkPickerControls, { InternalRoutesDatalist } from './LinkPickerControls'

interface Props {
  path: string
  value: string | null | undefined
  /** Optional small label shown next to the trigger (e.g. "Primary CTA"). */
  label?: string
}

/**
 * Edit-mode-only inline link picker. Renders nothing on the public site.
 * In edit mode renders a small trigger ("🔗 Edit link") that opens an
 * inline popover wrapping LinkPickerControls plus Save / Cancel.
 */
export default function EditableLink({ path, value, label }: Props) {
  const ctx = useEditing()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  // Re-sync the draft when the canonical value changes externally
  // (e.g., when the parent updates after a discard or remote refresh).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(value ?? '')
  }, [value])

  if (!ctx?.isEditing) return null

  const save = () => {
    const trimmed = draft.trim()
    if (trimmed !== (value ?? '')) {
      ctx.updateAt(path, trimmed)
    }
    setOpen(false)
  }

  const cancel = () => {
    setDraft(value ?? '')
    setOpen(false)
  }

  const display = value && value.trim().length > 0 ? value : '(no link)'

  if (!open) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium bg-white/95 hover:bg-white text-gray-700 shadow-sm border border-gray-200 max-w-full"
        title="Edit link"
      >
        <Link2 className="w-3 h-3 shrink-0" />
        <span className="truncate">
          {label ? `${label}: ` : ''}
          {display}
        </span>
      </button>
    )
  }

  return (
    <div
      className="absolute z-50 mt-1 w-96 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
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
        <button type="button" onClick={cancel} className="text-gray-400 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
      </div>

      <LinkPickerControls
        value={draft}
        onChange={setDraft}
        autoFocus
        inputRef={inputRef}
      />

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
    </div>
  )
}

export { InternalRoutesDatalist }
