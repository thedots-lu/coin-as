'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { ServiceDocument } from '@/lib/types/service'
import { LocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'

export default function AdminServicesPage() {
  const [items, setItems] = useState<ServiceDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ServiceDocument | null>(null)
  const [saving, setSaving] = useState(false)

  // Inline edit state
  const [editTitle, setEditTitle] = useState<LocaleString>({ en: '', fr: '', nl: '' })
  const [editShortTitle, setEditShortTitle] = useState<LocaleString>({ en: '', fr: '', nl: '' })
  const [editCategory, setEditCategory] = useState<'consulting' | 'centers' | 'cyber'>('consulting')
  const [editOrder, setEditOrder] = useState(0)
  const [editPublished, setEditPublished] = useState(false)
  const [editOverview, setEditOverview] = useState<LocaleString>({ en: '', fr: '', nl: '' })
  const [editHeroSubtitle, setEditHeroSubtitle] = useState<LocaleString>({ en: '', fr: '', nl: '' })

  const fetchServices = useCallback(async () => {
    try {
      const q = query(collection(db, 'services'), orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceDocument)))
    } catch (err) {
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServices() }, [fetchServices])

  const startEdit = (item: ServiceDocument) => {
    setEditing(item)
    setEditTitle(item.title)
    setEditShortTitle(item.shortTitle)
    setEditCategory(item.category)
    setEditOrder(item.order)
    setEditPublished(item.published)
    setEditOverview(item.overview)
    setEditHeroSubtitle(item.heroSubtitle)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'services', editing.id), {
        title: editTitle,
        shortTitle: editShortTitle,
        category: editCategory,
        order: editOrder,
        published: editPublished,
        overview: editOverview,
        heroSubtitle: editHeroSubtitle,
        updatedAt: Timestamp.now(),
      })
      await revalidate('/services')
      await revalidate(`/services/${editing.slug}`)
      await fetchServices()
      setEditing(null)
    } catch (err) {
      console.error('Error saving service:', err)
      alert('Error saving. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: ServiceDocument) => {
    if (!confirm(`Delete service "${item.title.en}"? This cannot be undone.`)) return
    try {
      await deleteDoc(doc(db, 'services', item.id))
      await revalidate('/services')
      await fetchServices()
    } catch (err) {
      console.error('Error deleting service:', err)
    }
  }

  const handleTogglePublished = async (item: ServiceDocument) => {
    try {
      await updateDoc(doc(db, 'services', item.id), {
        published: !item.published,
        updatedAt: Timestamp.now(),
      })
      await revalidate('/services')
      await fetchServices()
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

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Service: {editing.slug}</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editPublished}
              onChange={(e) => setEditPublished(e.target.checked)}
              className="rounded border-gray-300"
            />
            Published
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as 'consulting' | 'centers' | 'cyber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="consulting">Consulting</option>
              <option value="centers">Centers</option>
              <option value="cyber">Cyber</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input
              type="number"
              value={editOrder}
              onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <LocaleEditor label="Title" value={editTitle} onChange={setEditTitle} />
        <LocaleEditor label="Short Title" value={editShortTitle} onChange={setEditShortTitle} />
        <LocaleEditor label="Hero Subtitle" value={editHeroSubtitle} onChange={setEditHeroSubtitle} multiline rows={3} />
        <LocaleEditor label="Overview" value={editOverview} onChange={setEditOverview} multiline rows={6} />

        <p className="text-sm text-gray-500">
          Note: Section content editing is available via the Pages editor for more complex layouts.
        </p>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(null)}
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
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No services found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{item.order}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.title.en || item.title.fr}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{item.slug}</td>
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
                    <button onClick={() => handleDelete(item)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
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
