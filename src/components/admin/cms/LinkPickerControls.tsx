'use client'

import { useEffect, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { isExternalUrl, INTERNAL_ROUTES } from '@/lib/utils/links'
import { ROUTE_CATEGORIES, RouteEntry, getCategory } from './cmsRoutes'

const DATALIST_ID = 'cms-internal-routes'

interface Props {
  value: string
  onChange: (next: string) => void
  /**
   * Called when the URL field loses focus. Used by drawer-style consumers
   * that want to commit immediately on blur. Popover-style consumers can
   * ignore this and commit on their own Save button.
   */
  onUrlBlur?: (next: string) => void
  /**
   * Called when the user picks an item from the items dropdown (explicit
   * action — drawer-style consumers can commit immediately).
   */
  onPick?: (href: string) => void
  /** Auto-focus the URL input when first rendered. */
  autoFocus?: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
}

/**
 * Shared controls used by both the inline (popover) picker and the drawer
 * field. Renders the category dropdown, the items dropdown, the URL field
 * and a status line. State for the dropdowns is local; URL state is owned
 * by the parent (controlled).
 */
export default function LinkPickerControls({
  value,
  onChange,
  onUrlBlur,
  onPick,
  autoFocus,
  inputRef,
}: Props) {
  const [categoryId, setCategoryId] = useState<string>('')
  const [items, setItems] = useState<RouteEntry[] | null>(null)
  const [loadingItems, setLoadingItems] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const internalRef = useRef<HTMLInputElement>(null)
  const ref = inputRef ?? internalRef

  useEffect(() => {
    if (!categoryId) return
    const cat = getCategory(categoryId)
    if (!cat) return
    let alive = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingItems(true)
    setLoadError(null)
    cat
      .load()
      .then((list) => {
        if (alive) setItems(list)
      })
      .catch((err: unknown) => {
        console.error('[LinkPickerControls] failed to load category', categoryId, err)
        if (alive) setLoadError('Could not load this category.')
      })
      .finally(() => {
        if (alive) setLoadingItems(false)
      })
    return () => {
      alive = false
    }
  }, [categoryId])

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus])

  const external = isExternalUrl(value)

  return (
    <>
      <div className="space-y-2 mb-3">
        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          Quick pick (internal)
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select a category…</option>
          {ROUTE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        {categoryId && (
          <select
            value=""
            disabled={loadingItems || !!loadError}
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value)
                if (onPick) onPick(e.target.value)
              }
            }}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-60"
          >
            <option value="">
              {loadingItems
                ? 'Loading…'
                : loadError
                  ? loadError
                  : items && items.length > 0
                    ? 'Pick an item…'
                    : 'No published items'}
            </option>
            {items?.map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
        URL
      </label>
      <input
        ref={ref}
        type="text"
        list={DATALIST_ID}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          if (onUrlBlur) onUrlBlur(e.target.value)
        }}
        placeholder="/services or https://..."
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />

      <p className="mt-1.5 text-[11px] text-gray-500 flex items-center gap-1">
        {external ? (
          <>
            <ExternalLink className="w-3 h-3" />
            External — opens in a new tab
          </>
        ) : value.trim() === '' ? (
          'Empty — no link'
        ) : (
          'Internal route'
        )}
      </p>
    </>
  )
}

export function InternalRoutesDatalist() {
  return (
    <datalist id={DATALIST_ID}>
      {INTERNAL_ROUTES.map((r) => (
        <option key={r} value={r} />
      ))}
    </datalist>
  )
}
