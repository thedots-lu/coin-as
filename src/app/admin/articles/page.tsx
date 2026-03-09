'use client'

import { useEffect, useState, useCallback } from 'react'
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
import { db } from '@/lib/firebase/config'
import { Article } from '@/lib/types/article'
import { createEmptyLocaleString, LocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'

export default function AdminArticlesPage() {
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
  const [category, setCategory] = useState<'resource' | 'case_study'>('resource')
  const [published, setPublished] = useState(false)
  const [author, setAuthor] = useState('')
  const [tags, setTags] = useState('')

  const fetchArticles = useCallback(async () => {
    try {
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article)))
    } catch (err) {
      console.error('Error fetching articles:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const resetForm = () => {
    setTitle(createEmptyLocaleString())
    setContent(createEmptyLocaleString())
    setExcerpt(createEmptyLocaleString())
    setSlug(createEmptyLocaleString())
    setImageUrl('')
    setCategory('resource')
    setPublished(false)
    setAuthor('')
    setTags('')
  }

  const startEdit = (item: Article) => {
    setEditing(item)
    setTitle(item.title)
    setContent(item.content)
    setExcerpt(item.excerpt)
    setSlug(item.slug)
    setImageUrl(item.imageUrl || '')
    setCategory(item.category)
    setPublished(item.published)
    setAuthor(item.author)
    setTags(item.tags.join(', '))
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
        imageUrl: imageUrl || null,
        category,
        published,
        publishedAt: published ? new Date() : null,
        author,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        updatedAt: now,
      }
      if (editing) {
        await updateDoc(doc(db, 'articles', editing.id), data)
      } else {
        await addDoc(collection(db, 'articles'), { ...data, createdAt: now })
      }
      await revalidate('/knowledge-hub')
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
    if (!confirm('Delete this article? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'articles', id))
      await revalidate('/knowledge-hub')
      await fetchArticles()
    } catch (err) {
      console.error('Error deleting article:', err)
    }
  }

  const handleTogglePublished = async (item: Article) => {
    try {
      await updateDoc(doc(db, 'articles', item.id), {
        published: !item.published,
        updatedAt: Timestamp.now(),
      })
      await revalidate('/knowledge-hub')
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
            {editing ? 'Edit Article' : 'Create Article'}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'resource' | 'case_study')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="resource">Resource</option>
              <option value="case_study">Case Study</option>
            </select>
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
        </div>

        <LocaleEditor label="Title" value={title} onChange={setTitle} />
        <LocaleEditor label="Slug" value={slug} onChange={setSlug} />
        <LocaleEditor label="Excerpt" value={excerpt} onChange={setExcerpt} multiline rows={3} />
        <LocaleEditor label="Content" value={content} onChange={setContent} multiline rows={10} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

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
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + New Article
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No articles yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{item.title.en || item.title.fr || '(untitled)'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{item.category.replace('_', ' ')}</td>
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
                    <button onClick={() => startEdit(item)} className="text-sm text-primary-600 hover:text-primary-700 mr-3">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
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
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, secret: process.env.NEXT_PUBLIC_REVALIDATION_SECRET }),
    })
  } catch { /* best-effort */ }
}
