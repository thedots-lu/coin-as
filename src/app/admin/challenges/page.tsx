'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { Challenge } from '@/lib/types/challenge'
import { createEmptyLocaleString, LocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'

type FormState = {
  slug: string
  title: LocaleString
  subtitle: LocaleString
  intro: LocaleString
  context: LocaleString
  heroImage: string
  iconKey: string
  order: number
  published: boolean
  regulationsJson: string
  threatsJson: string
  coinSolutionsJson: string
  testimonialJson: string
  relatedServicesJson: string
}

function emptyForm(): FormState {
  return {
    slug: '',
    title: createEmptyLocaleString(),
    subtitle: createEmptyLocaleString(),
    intro: createEmptyLocaleString(),
    context: createEmptyLocaleString(),
    heroImage: '',
    iconKey: '',
    order: 0,
    published: false,
    regulationsJson: '[]',
    threatsJson: '[]',
    coinSolutionsJson: '[]',
    testimonialJson: 'null',
    relatedServicesJson: '[]',
  }
}

function fromChallenge(c: Challenge): FormState {
  return {
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    intro: c.intro,
    context: c.context,
    heroImage: c.heroImage || '',
    iconKey: c.iconKey || '',
    order: c.order ?? 0,
    published: c.published ?? false,
    regulationsJson: JSON.stringify(c.regulations ?? [], null, 2),
    threatsJson: JSON.stringify(c.threats ?? [], null, 2),
    coinSolutionsJson: JSON.stringify(c.coinSolutions ?? [], null, 2),
    testimonialJson: JSON.stringify(c.testimonial ?? null, null, 2),
    relatedServicesJson: JSON.stringify(c.relatedServices ?? [], null, 2),
  }
}

export default function AdminChallengesPage() {
  const [items, setItems] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Challenge | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [error, setError] = useState<string | null>(null)

  const fetchChallenges = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'challenges'))
      const data = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as Challenge))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setItems(data)
    } catch (err) {
      console.error('Error fetching challenges:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  const startCreate = () => {
    setForm(emptyForm())
    setEditing(null)
    setCreating(true)
    setError(null)
  }

  const startEdit = (c: Challenge) => {
    setForm(fromChallenge(c))
    setEditing(c)
    setCreating(false)
    setError(null)
  }

  const cancel = () => {
    setEditing(null)
    setCreating(false)
    setError(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let regulations, threats, coinSolutions, testimonial, relatedServices
      try {
        regulations = JSON.parse(form.regulationsJson)
        threats = JSON.parse(form.threatsJson)
        coinSolutions = JSON.parse(form.coinSolutionsJson)
        testimonial = JSON.parse(form.testimonialJson)
        relatedServices = JSON.parse(form.relatedServicesJson)
      } catch (parseErr) {
        setError('JSON parse error: ' + (parseErr as Error).message)
        setSaving(false)
        return
      }

      const slug = form.slug.trim()
      if (!slug) {
        setError('Slug is required.')
        setSaving(false)
        return
      }

      const now = Timestamp.now()
      const payload = {
        slug,
        title: form.title,
        subtitle: form.subtitle,
        intro: form.intro,
        context: form.context,
        heroImage: form.heroImage || '',
        iconKey: form.iconKey || null,
        order: Number(form.order) || 0,
        published: form.published,
        regulations,
        threats,
        coinSolutions,
        testimonial,
        relatedServices,
      }

      if (editing) {
        await updateDoc(doc(db, 'challenges', editing.id), {
          ...payload,
          updatedAt: now,
        })
      } else {
        // Check if a doc with that slug as id already exists
        const existing = await getDoc(doc(db, 'challenges', slug))
        if (existing.exists()) {
          // Fall back to addDoc with auto id
          await addDoc(collection(db, 'challenges'), {
            ...payload,
            createdAt: now,
            updatedAt: now,
          })
        } else {
          // Prefer slug as document id
          await setDoc(doc(db, 'challenges', slug), {
            ...payload,
            createdAt: now,
            updatedAt: now,
          })
        }
      }
      await fetchChallenges()
      cancel()
    } catch (err) {
      console.error('Error saving challenge:', err)
      setError('Error saving. ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this challenge? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'challenges', id))
      await fetchChallenges()
    } catch (err) {
      console.error('Error deleting challenge:', err)
    }
  }

  const handleTogglePublished = async (item: Challenge) => {
    try {
      await updateDoc(doc(db, 'challenges', item.id), {
        published: !item.published,
        updatedAt: Timestamp.now(),
      })
      await fetchChallenges()
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
      <form
        onSubmit={handleSave}
        className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editing ? 'Edit Challenge' : 'Create Challenge'}
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

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug {editing && <span className="text-xs text-gray-400">(read-only)</span>}
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              readOnly={!!editing}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="banking-finance"
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon Key</label>
            <input
              type="text"
              value={form.iconKey}
              onChange={(e) => setForm({ ...form, iconKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Building2, Shield, Zap, Landmark"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
            <input
              type="text"
              value={form.heroImage}
              onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="/images/coin/..."
            />
          </div>
        </div>

        <LocaleEditor label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <LocaleEditor label="Subtitle" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} />
        <LocaleEditor label="Intro" value={form.intro} onChange={(v) => setForm({ ...form, intro: v })} multiline rows={4} />
        <LocaleEditor label="Context" value={form.context} onChange={(v) => setForm({ ...form, context: v })} multiline rows={4} />

        <JsonField
          label="Regulations (JSON: array of { text: LocaleString })"
          value={form.regulationsJson}
          onChange={(v) => setForm({ ...form, regulationsJson: v })}
        />
        <JsonField
          label="Threats (JSON: array of { title: LocaleString, description: LocaleString })"
          value={form.threatsJson}
          onChange={(v) => setForm({ ...form, threatsJson: v })}
        />
        <JsonField
          label="Coin Solutions (JSON: array of { title, description, href })"
          value={form.coinSolutionsJson}
          onChange={(v) => setForm({ ...form, coinSolutionsJson: v })}
        />
        <JsonField
          label="Testimonial (JSON object or null)"
          value={form.testimonialJson}
          onChange={(v) => setForm({ ...form, testimonialJson: v })}
          rows={6}
        />
        <JsonField
          label="Related Services (JSON: array of { title: LocaleString, href })"
          value={form.relatedServicesJson}
          onChange={(v) => setForm({ ...form, relatedServicesJson: v })}
        />

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={cancel}
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
        <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + New Challenge
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No challenges yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.title?.en || item.title?.fr || '(untitled)'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.order ?? 0}</td>
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

function JsonField({
  label,
  value,
  onChange,
  rows = 10,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-mono resize-y"
      />
    </div>
  )
}
