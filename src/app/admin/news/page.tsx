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
import { dbAdmin as db } from '@/lib/firebase/config'
import { NewsItem } from '@/lib/types/news'
import NewsForm from '@/components/admin/NewsForm'

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchNews = useCallback(async () => {
    try {
      const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NewsItem))
      setItems(data)
    } catch (err) {
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const handleSave = async (data: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaving(true)
    try {
      const now = Timestamp.now()
      if (editing) {
        await updateDoc(doc(db, 'news', editing.id), {
          ...data,
          updatedAt: now,
        })
      } else {
        await addDoc(collection(db, 'news'), {
          ...data,
          createdAt: now,
          updatedAt: now,
        })
      }
      await revalidate('/news')
      await fetchNews()
      setEditing(null)
      setCreating(false)
    } catch (err) {
      console.error('Error saving news:', err)
      alert('Error saving. Check console for details.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news item? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'news', id))
      await revalidate('/news')
      await fetchNews()
    } catch (err) {
      console.error('Error deleting news:', err)
    }
  }

  const handleTogglePublished = async (item: NewsItem) => {
    try {
      await updateDoc(doc(db, 'news', item.id), {
        published: !item.published,
        updatedAt: Timestamp.now(),
      })
      await revalidate('/news')
      await fetchNews()
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
      <div>
        <NewsForm
          news={editing || undefined}
          onSave={handleSave}
          onCancel={() => {
            setEditing(null)
            setCreating(false)
          }}
        />
        {saving && (
          <div className="mt-4 text-sm text-gray-500">Saving...</div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">News</h1>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + New Article
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No news items yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{item.title.en || item.title.fr || '(untitled)'}</div>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{item.type}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublished(item)}
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        item.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.author}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(item)}
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
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, secret: process.env.NEXT_PUBLIC_REVALIDATION_SECRET }),
    })
  } catch {
    // Revalidation is best-effort
  }
}
