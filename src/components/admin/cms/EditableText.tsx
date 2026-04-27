'use client'

import { CSSProperties, FocusEvent, KeyboardEvent, MouseEvent } from 'react'
import { useEditing } from './EditingContext'
import { getLocalizedField } from '@/lib/locale'
import { LocaleString } from '@/lib/types/locale'

type Tag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'div'

interface Props {
  path: string
  value: LocaleString
  as?: Tag
  multiline?: boolean
  className?: string
  style?: CSSProperties
  placeholder?: string
}

export default function EditableText({
  path,
  value,
  as = 'span',
  multiline = false,
  className,
  style,
  placeholder,
}: Props) {
  const ctx = useEditing()
  const locale = ctx?.activeLocale ?? 'en'
  const ownLocaleText = value?.[locale] ?? ''
  const fallbackText = getLocalizedField(value, locale) // falls back to EN if active locale empty
  const isFallback = ownLocaleText === '' && fallbackText !== ''

  const Tag = as as React.ElementType

  if (!ctx?.isEditing) {
    return (
      <Tag className={className} style={style}>
        {fallbackText}
      </Tag>
    )
  }

  const handleBlur = (e: FocusEvent<HTMLElement>) => {
    const raw = multiline
      ? (e.currentTarget as HTMLElement).innerText
      : ((e.currentTarget as HTMLElement).textContent ?? '')
    const cleaned = raw.replace(/​/g, '').replace(/\r\n?/g, '\n')
    const trimmed = multiline ? cleaned.replace(/\n+$/, '') : cleaned.trim()
    if (trimmed !== ownLocaleText) {
      ctx.updateAt(path, { ...value, [locale]: trimmed })
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).blur()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).blur()
    }
  }

  // Prevent ancestor links (e.g. <Button href=...>) from navigating when the
  // user clicks the editable area. preventDefault on the bubbling event cancels
  // the default action of the parent <a>; the contenteditable already received
  // focus on mousedown, so the cursor still lands correctly.
  const cancelNavigation = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
  }

  const showPlaceholder = ownLocaleText === ''
  const placeholderText = showPlaceholder
    ? isFallback
      ? `EN: ${fallbackText}`
      : placeholder || `(empty in ${locale.toUpperCase()})`
    : ''

  const editableClass = [
    className,
    'cms-editable',
    isFallback ? 'cms-fallback' : '',
    showPlaceholder ? 'cms-empty' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag
      key={`${path}-${locale}`}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={cancelNavigation}
      className={editableClass}
      style={{ whiteSpace: multiline ? 'pre-wrap' : undefined, ...style }}
      data-cms-placeholder={placeholderText || undefined}
      data-cms-locale={locale}
      data-cms-path={path}
      spellCheck
    >
      {ownLocaleText}
    </Tag>
  )
}
