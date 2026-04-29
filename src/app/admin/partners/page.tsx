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
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { deleteFile } from '@/lib/firebase/upload'
import { Partner } from '@/lib/types/partner'
import { createEmptyLocaleString, LocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'
import ImageUpload from '@/components/admin/ImageUpload'

export default function AdminPartnersPage() {
  const [items, setItems] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState<'business' | 'technology'>('business')
  const [logoUrl, setLogoUrl] = useState('')
  const [description, setDescription] = useState<LocaleString>(createEmptyLocaleString())
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoCaption, setVideoCaption] = useState<LocaleString>(createEmptyLocaleString())
  const [order, setOrder] = useState(0)
  const [published, setPublished] = useState(true)

  const fetchPartners = useCallback(async () => {
    try {
      const q = query(collection(db, 'partners'), orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Partner)))
    } catch (err) {
      console.error('Error fetching partners:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPartners() }, [fetchPartners])

  const resetForm = () => {
    setName('')
    setType('business')
    setLogoUrl('')
    setDescription(createEmptyLocaleString())
    setWebsiteUrl('')
    setVideoUrl('')
    setVideoCaption(createEmptyLocaleString())
    setOrder(0)
    setPublished(true)
  }

  const startEdit = (item: Partner) => {
    setEditing(item)
    setName(item.name)
    setType(item.type)
    setLogoUrl(item.logoUrl)
    setDescription(item.description)
    setWebsiteUrl(item.websiteUrl || '')
    setVideoUrl(item.videoUrl || '')
    setVideoCaption(item.videoCaption || createEmptyLocaleString())
    setOrder(item.order)
    setPublished(item.published)
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
    if (!logoUrl.trim()) {
      alert('Please upload a logo or provide a logo URL.')
      return
    }
    setSaving(true)
    try {
      const now = Timestamp.now()
      const data = {
        name,
        type,
        logoUrl,
        description,
        websiteUrl: websiteUrl || null,
        videoUrl: videoUrl || null,
        videoCaption: videoUrl ? videoCaption : null,
        order,
        published,
        updatedAt: now,
      }
      if (editing) {
        await updateDoc(doc(db, 'partners', editing.id), data)
        // If the logo was replaced, drop the old object from R2
        if (editing.logoUrl && editing.logoUrl !== logoUrl) {
          await deleteFile(editing.logoUrl)
        }
      } else {
        await addDoc(collection(db, 'partners'), { ...data, createdAt: now })
      }
      await revalidate('/partners')
      await fetchPartners()
      handleCancel()
    } catch (err) {
      console.error('Error saving partner:', err)
      alert('Error saving. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this partner? This cannot be undone.')) return
    const item = items.find((p) => p.id === id)
    try {
      await deleteDoc(doc(db, 'partners', id))
      if (item?.logoUrl) await deleteFile(item.logoUrl)
      await revalidate('/partners')
      await fetchPartners()
    } catch (err) {
      console.error('Error deleting partner:', err)
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
            {editing ? 'Edit Partner' : 'Create Partner'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'business' | 'technology')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="business">Business</option>
              <option value="technology">Technology</option>
            </select>
          </div>
        </div>

        <ImageUpload
          label="Logo"
          value={logoUrl}
          onChange={setLogoUrl}
          storagePath="partners"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <LocaleEditor label="Description" value={description} onChange={setDescription} multiline />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube)</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtu.be/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <LocaleEditor label="Video Caption" value={videoCaption} onChange={setVideoCaption} multiline rows={2} />

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
        <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + New Partner
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No partners yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{item.order}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{item.type}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      item.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.published ? 'Published' : 'Draft'}
                    </span>
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
    await triggerRevalidate(path)
  } catch { /* best-effort */ }
}
