'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { deleteFile } from '@/lib/firebase/upload'
import { logAudit } from '@/lib/firebase/audit-log'
import {
  Article,
  ArticleAccentColor,
  ARTICLE_ACCENT_COLORS,
  DEFAULT_ARTICLE_ACCENT_COLOR,
} from '@/lib/types/article'
import { createEmptyLocaleString, LocaleString } from '@/lib/types/locale'
import { generateSlug } from '@/lib/utils/slug'
import LocaleEditor from '@/components/admin/LocaleEditor'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUpload from '@/components/admin/ImageUpload'

type ArticleKind = 'resource' | 'case_study'

interface ArticlesAdminProps {
  kind: ArticleKind
  pageTitle: string
  noun: string
  revalidatePath: string
}

export default function ArticlesAdmin({
  kind,
  pageTitle,
  noun,
  revalidatePath,
}: ArticlesAdminProps) {
  const [items, setItems] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Article | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState<LocaleString>(createEmptyLocaleString())
  const [content, setContent] = useState<LocaleString>(createEmptyLocaleString())
  const [excerpt, setExcerpt] = useState<LocaleString>(createEmptyLocaleString())
  const [slug, setSlug] = useState<LocaleString>(createEmptyLocaleString())
  const [imageUrl, setImageUrl] = useState('')
  const [accentColor, setAccentColor] = useState<ArticleAccentColor>(
    DEFAULT_ARTICLE_ACCENT_COLOR,
  )
  const [published, setPublished] = useState(false)
  const [author, setAuthor] = useState('')
  const [tags, setTags] = useState('')
  const slugManuallyEdited = useRef(false)

  useEffect(() => {
    if (slugManuallyEdited.current) return
    if (!title.en) return
    setSlug((prev) => ({ ...prev, en: generateSlug(title.en) }))
  }, [title.en])

  const handleSlugChange = (value: LocaleString) => {
    slugManuallyEdited.current = true
    setSlug(value)
  }

  const handleContentChange = (html: string) => {
    setContent({ en: html, fr: content.fr ?? '', nl: content.nl ?? '' })
  }

  const fetchArticles = useCallback(async () => {
    try {
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article))
      setItems(all.filter((a) => a.category === kind))
    } catch (err) {
      console.error('Error fetching articles:', err)
    } finally {
      setLoading(false)
    }
  }, [kind])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const resetForm = () => {
    setTitle(createEmptyLocaleString())
    setContent(createEmptyLocaleString())
    setExcerpt(createEmptyLocaleString())
    setSlug(createEmptyLocaleString())
    setImageUrl('')
    setAccentColor(DEFAULT_ARTICLE_ACCENT_COLOR)
    setPublished(false)
    setAuthor('')
    setTags('')
    slugManuallyEdited.current = false
  }

  const startEdit = (item: Article) => {
    setEditing(item)
    setTitle(item.title)
    setContent(item.content)
    setExcerpt(item.excerpt)
    setSlug(item.slug)
    setImageUrl(item.imageUrl || '')
    setAccentColor(item.accentColor ?? DEFAULT_ARTICLE_ACCENT_COLOR)
    setPublished(item.published)
    setAuthor(item.author)
    setTags(item.tags.join(', '))
    slugManuallyEdited.current = Boolean(item.slug?.en)
  }

  const startCreate = () => {
    resetForm()
    setCreating(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setCreating(false)
    resetForm()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const now = Timestamp.now()
      const data = {
        title,
        content,
        excerpt,
        slug,
        imageUrl: kind === 'case_study' ? null : imageUrl || null,
        category: kind,
        ...(kind === 'case_study' ? { accentColor } : {}),
        published,
        publishedAt: published ? new Date() : null,
        author,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        updatedAt: now,
      }
      const label = title.en || title.fr || title.nl || `(untitled ${noun.toLowerCase()})`
      if (editing) {
        await updateDoc(doc(db, 'articles', editing.id), data)
        if (editing.imageUrl && editing.imageUrl !== imageUrl) {
          await deleteFile(editing.imageUrl)
        }
        await logAudit({ action: 'update', resource: 'articles', resourceId: editing.id, label })
      } else {
        const created = await addDoc(collection(db, 'articles'), { ...data, createdAt: now })
        await logAudit({ action: 'create', resource: 'articles', resourceId: created.id, label })
      }
      await revalidate(revalidatePath)
      await fetchArticles()
      handleCancel()
    } catch (err) {
      console.error('Error saving article:', err)
      alert('Error saving. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete this ${noun.toLowerCase()}? This cannot be undone.`)) return
    const item = items.find((a) => a.id === id)
    try {
      const label =
        item?.title?.en || item?.title?.fr || item?.title?.nl || `(untitled ${noun.toLowerCase()})`
      await deleteDoc(doc(db, 'articles', id))
      if (item?.imageUrl) await deleteFile(item.imageUrl)
      await logAudit({ action: 'delete', resource: 'articles', resourceId: id, label })
      await revalidate(revalidatePath)
      await fetchArticles()
    } catch (err) {
      console.error('Error deleting article:', err)
    }
  }

  const handleTogglePublished = async (item: Article) => {
    try {
      const nextPublished = !item.published
      await updateDoc(doc(db, 'articles', item.id), {
        published: nextPublished,
        updatedAt: Timestamp.now(),
      })
      await logAudit({
        action: 'visibility_toggle',
        resource: 'articles',
        resourceId: item.id,
        label:
          item.title?.en ||
          item.title?.fr ||
          item.title?.nl ||
          `(untitled ${noun.toLowerCase()})`,
        details: { published: nextPublished },
      })
      await revalidate(revalidatePath)
      await fetchArticles()
    } catch (err) {
      console.error('Error toggling published:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (creating || editing) {
    return (
      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editing ? `Edit ${noun}` : `Create ${noun}`}
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-gray-300"
            />
            Published
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <LocaleEditor label="Title" value={title} onChange={setTitle} />

        <div>
          <LocaleEditor label="Slug" value={slug} onChange={handleSlugChange} />
          <p className="mt-1 text-xs text-gray-500">
            {slugManuallyEdited.current
              ? 'Manually edited — will no longer auto-update from title.'
              : 'Auto-generated from title.'}
          </p>
        </div>

        <LocaleEditor label="Excerpt" value={excerpt} onChange={setExcerpt} multiline rows={3} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <RichTextEditor value={content.en ?? ''} onChange={handleContentChange} />
        </div>

        {kind === 'case_study' ? (
          <AccentColorPicker value={accentColor} onChange={setAccentColor} />
        ) : (
          <ImageUpload
            label="Image"
            value={imageUrl}
            onChange={setImageUrl}
            storagePath="articles"
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + New {noun}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No {noun.toLowerCase()}s yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {item.title.en || item.title.fr || '(untitled)'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublished(item)}
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        item.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-sm text-primary-600 hover:text-primary-700 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

async function revalidate(path: string) {
  try {
    await triggerRevalidate(path)
  } catch {
    /* best-effort */
  }
}

const ACCENT_SWATCH: Record<ArticleAccentColor, { label: string; bg: string }> = {
  green: { label: 'Green', bg: 'bg-accent-500' },
  red: { label: 'Red', bg: 'bg-coin-red-500' },
  navy: { label: 'Navy', bg: 'bg-primary-500' },
  slate: { label: 'Slate', bg: 'bg-secondary-500' },
}

function AccentColorPicker({
  value,
  onChange,
}: {
  value: ArticleAccentColor
  onChange: (v: ArticleAccentColor) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Accent colour</label>
      <p className="text-xs text-gray-500 mb-2">
        Coloured strip shown on the case-study card (replaces the image).
      </p>
      <div className="flex items-center gap-2">
        {ARTICLE_ACCENT_COLORS.map((c) => {
          const swatch = ACCENT_SWATCH[c]
          const selected = value === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-pressed={selected}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                selected
                  ? 'border-gray-900 bg-gray-50 text-gray-900'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={`block w-4 h-4 rounded ${swatch.bg}`} />
              {swatch.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
