'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { FaqItem } from '@/lib/types/faq'
import { LocaleString, createEmptyLocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'

type FormState = {
  question: LocaleString
  answer: LocaleString
  category: string
  order: number
  published: boolean
}

function emptyForm(): FormState {
  return {
    question: createEmptyLocaleString(),
    answer: createEmptyLocaleString(),
    category: 'general',
    order: 0,
    published: true,
  }
}

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())

  const fetchItems = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'faq_items'))
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FaqItem))
      data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setItems(data)
    } catch (err) {
      console.error('Error fetching FAQ items:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const startCreate = () => {
    setForm({ ...emptyForm(), order: items.length })
    setEditingId(null)
    setCreating(true)
  }

  const startEdit = (item: FaqItem) => {
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category,
      order: item.order,
      published: item.published,
    })
    setEditingId(item.id)
    setCreating(false)
  }

  const cancelForm = () => {
    setEditingId(null)
    setCreating(false)
    setForm(emptyForm())
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const now = Timestamp.now()
      const payload = {
        question: form.question,
        answer: form.answer,
        category: form.category,
        order: Number(form.order) || 0,
        published: form.published,
      }
      if (editingId) {
        await updateDoc(doc(db, 'faq_items', editingId), { ...payload, updatedAt: now })
      } else {
        await addDoc(collection(db, 'faq_items'), {
          ...payload,
          createdAt: now,
          updatedAt: now,
        })
      }
      await fetchItems()
      cancelForm()
    } catch (err) {
      console.error('Error saving FAQ item:', err)
      alert('Error saving. Check console for details.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ item? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'faq_items', id))
      await fetchItems()
    } catch (err) {
      console.error('Error deleting FAQ item:', err)
    }
  }

  const handleTogglePublished = async (item: FaqItem) => {
    try {
      await updateDoc(doc(db, 'faq_items', item.id), {
        published: !item.published,
        updatedAt: Timestamp.now(),
      })
      await fetchItems()
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

  if (creating || editingId) {
    return (
      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit FAQ Item' : 'Create FAQ Item'}
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="rounded border-gray-300"
            />
            Published
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="general, services, compliance..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <LocaleEditor
          label="Question"
          value={form.question}
          onChange={(v) => setForm({ ...form, question: v })}
        />
        <LocaleEditor
          label="Answer (markdown supported)"
          value={form.answer}
          onChange={(v) => setForm({ ...form, answer: v })}
          multiline
          rows={10}
        />

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={cancelForm}
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
        <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + New FAQ Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No FAQ items yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Question</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {item.question?.en || item.question?.fr || '(untitled)'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.order}</td>
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
