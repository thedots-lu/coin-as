'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Palette,
} from 'lucide-react'
import { useEditing, EditingContextValue } from './EditingContext'
import { LocaleString } from '@/lib/types/locale'
import { getLocalizedField } from '@/lib/locale'
import { isHtml, sanitizeRichHtml } from '@/lib/utils/html'

interface Props {
  path: string
  value: LocaleString
  className?: string
}

const COLOR_PRESETS: Array<{ label: string; value: string | null }> = [
  { label: 'Default', value: null },
  { label: 'Primary', value: '#004779' },
  { label: 'Accent', value: '#0a8a3a' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Slate', value: '#475569' },
  { label: 'Black', value: '#0f172a' },
]

/**
 * Inline rich-text editor with a TipTap bubble menu (Bold / Italic /
 * Underline / Align / Bullets / Color). Drop-in alternative to EditableText
 * for body-style fields where light formatting is useful. Stores HTML.
 *
 * Public render: dangerouslySetInnerHTML(sanitizeRichHtml(value)) when the
 * stored value is HTML, plain text otherwise (legacy values from the time
 * before this component existed keep working).
 */
export default function RichInlineText({ path, value, className }: Props) {
  const ctx = useEditing()
  if (ctx?.isEditing) {
    return <RichInlineEditor path={path} value={value} className={className} ctx={ctx} />
  }
  return <RichInlineDisplay value={value} className={className} />
}

function RichInlineDisplay({
  value,
  className,
}: {
  value: LocaleString
  className?: string
}) {
  const text = getLocalizedField(value)
  if (!text) return null
  if (isHtml(text)) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(text) }}
      />
    )
  }
  return <div className={className}>{text}</div>
}

function RichInlineEditor({
  path,
  value,
  className,
  ctx,
}: Props & { ctx: EditingContextValue }) {
  const locale = ctx.activeLocale
  const ownLocaleText = value?.[locale] ?? ''
  const fallbackText = getLocalizedField(value, locale)
  const isFallback = ownLocaleText === '' && fallbackText !== ''
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  // Store the latest value/path/locale in refs so the editor's onUpdate
  // callback (captured at editor creation time) always sees the current
  // ones rather than stale closures.
  const valueRef = useRef(value)
  const pathRef = useRef(path)
  const localeRef = useRef(locale)
  useEffect(() => {
    valueRef.current = value
    pathRef.current = path
    localeRef.current = locale
  }, [value, path, locale])

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content: ownLocaleText,
    editorProps: {
      attributes: {
        class: [
          className,
          'cms-editable',
          isFallback ? 'cms-fallback' : '',
          'focus:outline-none',
        ]
          .filter(Boolean)
          .join(' '),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const cleaned = html === '<p></p>' ? '' : html
      const currentLocale = localeRef.current
      const currentValue = valueRef.current
      if (cleaned !== (currentValue?.[currentLocale] ?? '')) {
        ctx.updateAt(pathRef.current, { ...currentValue, [currentLocale]: cleaned })
      }
    },
    immediatelyRender: false,
  })

  // External content changes (locale switch, undo from parent, etc.)
  useEffect(() => {
    if (!editor) return
    if (ownLocaleText !== editor.getHTML() && ownLocaleText !== '<p></p>') {
      editor.commands.setContent(ownLocaleText || '', { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownLocaleText, locale])

  if (!editor) {
    // Render a placeholder until TipTap mounts (avoids layout shift).
    return <div className={className}>{ownLocaleText || fallbackText}</div>
  }

  return (
    <>
      {mounted && (
        <BubbleMenu
          editor={editor}
          appendTo={() => document.body}
          options={{ placement: 'top', offset: 8 }}
          shouldShow={({ from, to, editor }) =>
            from !== to && editor.isEditable
          }
          // The plugin-managed div has no z-index by default; nested
          // stacking contexts on the page (e.g. `relative z-10` wrappers)
          // can render in front of it. Force the bubble above everything.
          style={{ zIndex: 1000 }}
        >
          <BubbleToolbar editor={editor} />
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  )
}

interface ToolbarProps {
  // The editor instance. Typed loosely to avoid coupling tiptap internal types
  // here — the toolbar only calls a handful of well-known commands.
  editor: ReturnType<typeof useEditor>
}

function BubbleToolbar({ editor }: ToolbarProps) {
  const [colorOpen, setColorOpen] = useState(false)
  if (!editor) return null

  // Run a chain command after restoring the selection that was active when
  // the toolbar received the mousedown. Even with preventDefault, some
  // browser/contexts collapse the ProseMirror selection on click — saving
  // it and restoring before the command keeps formatting reliable.
  const runWithSavedSelection = (
    fn: (chain: ReturnType<typeof editor.chain>) => ReturnType<typeof editor.chain>,
  ) => {
    const { from, to } = editor.state.selection
    fn(editor.chain().focus().setTextSelection({ from, to })).run()
  }

  return (
    <div
      // Prevent any mousedown on the toolbar (incl. dividers, gaps) from
      // shifting focus out of the editor — losing focus collapses the
      // selection and shouldShow then hides the bubble before our onClick
      // can run the command.
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      className="flex items-center gap-0.5 bg-primary-950/95 text-white rounded-md shadow-xl border border-white/10 px-1 py-1 backdrop-blur-sm">
      <ToolbarButton
        active={editor.isActive('bold')}
        onClick={() => runWithSavedSelection((c) => c.toggleBold())}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('italic')}
        onClick={() => runWithSavedSelection((c) => c.toggleItalic())}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('underline')}
        onClick={() => runWithSavedSelection((c) => c.toggleUnderline())}
        title="Underline"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        active={editor.isActive({ textAlign: 'left' })}
        onClick={() => runWithSavedSelection((c) => c.setTextAlign('left'))}
        title="Align left"
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'center' })}
        onClick={() => runWithSavedSelection((c) => c.setTextAlign('center'))}
        title="Align centre"
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'right' })}
        onClick={() => runWithSavedSelection((c) => c.setTextAlign('right'))}
        title="Align right"
      >
        <AlignRight className="w-3.5 h-3.5" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        active={editor.isActive('bulletList')}
        onClick={() => runWithSavedSelection((c) => c.toggleBulletList())}
        title="Bulleted list"
      >
        <List className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('orderedList')}
        onClick={() => runWithSavedSelection((c) => c.toggleOrderedList())}
        title="Numbered list"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </ToolbarButton>
      <Divider />
      <div className="relative">
        <ToolbarButton
          active={colorOpen}
          onClick={() => setColorOpen((v) => !v)}
          title="Text colour"
        >
          <Palette className="w-3.5 h-3.5" />
        </ToolbarButton>
        {colorOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white text-gray-900 rounded-md shadow-xl border border-gray-200 p-2 flex flex-col gap-1 z-50 min-w-[140px]">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (preset.value === null) {
                    runWithSavedSelection((c) => c.unsetColor())
                  } else {
                    runWithSavedSelection((c) => c.setColor(preset.value as string))
                  }
                  setColorOpen(false)
                }}
                className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-gray-100 rounded text-left"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                  style={preset.value ? { background: preset.value } : { background: 'transparent' }}
                />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-white/15 mx-0.5" />
}
