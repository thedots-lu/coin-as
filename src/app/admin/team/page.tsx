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
import { TeamMember } from '@/lib/types/team'
import { createEmptyLocaleString, LocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'

export default function AdminTeamPage() {
  const [items, setItems] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [position, setPosition] = useState<LocaleString>(createEmptyLocaleString())
  const [bio, setBio] = useState<LocaleString>(createEmptyLocaleString())
  const [photoUrl, setPhotoUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [order, setOrder] = useState(0)
  const [published, setPublished] = useState(true)

  const fetchTeam = useCallback(async () => {
    try {
      const q = query(collection(db, 'team'), orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMember)))
    } catch (err) {
      console.error('Error fetching team:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTeam() }, [fetchTeam])

  const resetForm = () => {
    setName('')
    setPosition(createEmptyLocaleString())
    setBio(createEmptyLocaleString())
    setPhotoUrl('')
    setLinkedinUrl('')
    setOrder(0)
    setPublished(true)
  }

  const startEdit = (item: TeamMember) => {
    setEditing(item)
    setName(item.name)
    setPosition(item.position)
    setBio(item.bio)
    setPhotoUrl(item.photoUrl || '')
    setLinkedinUrl(item.linkedinUrl || '')
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
    setSaving(true)
    try {
      const now = Timestamp.now()
      const data = {
        name,
        position,
        bio,
        photoUrl: photoUrl || null,
        linkedinUrl: linkedinUrl || null,
        order,
        published,
        updatedAt: now,
      }
      if (editing) {
        await updateDoc(doc(db, 'team', editing.id), data)
      } else {
        await addDoc(collection(db, 'team'), { ...data, createdAt: now })
      }
      await revalidate('/about')
      await fetchTeam()
      handleCancel()
    } catch (err) {
      console.error('Error saving team member:', err)
      alert('Error saving. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team member? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'team', id))
      await revalidate('/about')
      await fetchTeam()
    } catch (err) {
      console.error('Error deleting team member:', err)
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
            {editing ? 'Edit Team Member' : 'Add Team Member'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <LocaleEditor label="Position" value={position} onChange={setPosition} />
        <LocaleEditor label="Bio" value={bio} onChange={setBio} multiline rows={5} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
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
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + New Member
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No team members yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{item.order}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.position.en || item.position.fr}</td>
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
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, secret: process.env.NEXT_PUBLIC_REVALIDATION_SECRET }),
    })
  } catch { /* best-effort */ }
}
