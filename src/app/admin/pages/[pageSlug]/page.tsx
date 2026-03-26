'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { PageDocument, PageSection } from '@/lib/types/page'
import { LocaleString, createEmptyLocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'

export default function AdminPageEditor() {
  const params = useParams()
  const router = useRouter()
  const pageSlug = params.pageSlug as string

  const [page, setPage] = useState<PageDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedSection, setExpandedSection] = useState<number | null>(null)
  const [editedSections, setEditedSections] = useState<PageSection[]>([])
  const [editedTitle, setEditedTitle] = useState<LocaleString>(createEmptyLocaleString())
  const [editedBody, setEditedBody] = useState<LocaleString | undefined>(undefined)
  const [editedSeo, setEditedSeo] = useState({
    metaTitle: createEmptyLocaleString(),
    metaDescription: createEmptyLocaleString(),
    ogImage: '' as string | null,
  })

  const fetchPage = useCallback(async () => {
    try {
      const docRef = doc(db, 'pages', pageSlug)
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) {
        const data = { slug: snapshot.id, ...snapshot.data() } as PageDocument
        setPage(data)
        setEditedSections(data.sections || [])
        setEditedTitle(data.title)
        setEditedBody(data.body)
        setEditedSeo({
          metaTitle: data.seo?.metaTitle || createEmptyLocaleString(),
          metaDescription: data.seo?.metaDescription || createEmptyLocaleString(),
          ogImage: data.seo?.ogImage || null,
        })
      }
    } catch (err) {
      console.error('Error fetching page:', err)
    } finally {
      setLoading(false)
    }
  }, [pageSlug])

  useEffect(() => { fetchPage() }, [fetchPage])

  const updateSectionField = (sectionIndex: number, field: string, value: unknown) => {
    setEditedSections((prev) => {
      const updated = [...prev]
      updated[sectionIndex] = { ...updated[sectionIndex], [field]: value }
      return updated
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updateData: Record<string, unknown> = {
        title: editedTitle,
        sections: editedSections,
        seo: editedSeo,
        updatedAt: Timestamp.now(),
      }
      if (editedBody !== undefined) {
        updateData.body = editedBody
      }
      await updateDoc(doc(db, 'pages', pageSlug), updateData)
      await revalidate('/' + (pageSlug === 'home' ? '' : pageSlug))
      alert('Page saved successfully.')
    } catch (err) {
      console.error('Error saving page:', err)
      alert('Error saving page. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const renderSectionFields = (section: PageSection, index: number) => {
    const fields: React.ReactNode[] = []

    // Common locale string fields
    const localeFields: string[] = []
    const stringFields: string[] = []

    for (const [key, value] of Object.entries(section)) {
      if (key === 'type' || key === 'order') continue
      if (value && typeof value === 'object' && 'en' in value && 'fr' in value && 'nl' in value) {
        localeFields.push(key)
      } else if (typeof value === 'string') {
        stringFields.push(key)
      }
    }

    for (const field of localeFields) {
      const val = (section as unknown as Record<string, unknown>)[field] as LocaleString
      fields.push(
        <LocaleEditor
          key={field}
          label={formatFieldName(field)}
          value={val}
          onChange={(v) => updateSectionField(index, field, v)}
          multiline={['body', 'content', 'description', 'subtitle'].includes(field)}
        />
      )
    }

    for (const field of stringFields) {
      const val = (section as unknown as Record<string, unknown>)[field] as string
      fields.push(
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{formatFieldName(field)}</label>
          <input
            type="text"
            value={val}
            onChange={(e) => updateSectionField(index, field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      )
    }

    return fields
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Page &quot;{pageSlug}&quot; not found in Firestore.</p>
        <button
          onClick={() => router.push('/admin/pages')}
          className="mt-4 text-sm text-primary-600 hover:text-primary-700"
        >
          Back to Pages
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.push('/admin/pages')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            &larr; Back to Pages
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit: {pageSlug}</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Page'}
        </button>
      </div>

      {/* Page Title */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Page Title</h2>
        <LocaleEditor label="Title" value={editedTitle} onChange={setEditedTitle} />
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
        <div className="space-y-4">
          <LocaleEditor label="Meta Title" value={editedSeo.metaTitle} onChange={(v) => setEditedSeo({ ...editedSeo, metaTitle: v })} />
          <LocaleEditor label="Meta Description" value={editedSeo.metaDescription} onChange={(v) => setEditedSeo({ ...editedSeo, metaDescription: v })} multiline />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
            <input
              type="text"
              value={editedSeo.ogImage || ''}
              onChange={(e) => setEditedSeo({ ...editedSeo, ogImage: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Body (for legal pages) */}
      {editedBody !== undefined && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Page Body</h2>
          <LocaleEditor label="Body Content" value={editedBody} onChange={setEditedBody} multiline rows={12} />
        </div>
      )}

      {/* Sections */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Sections ({editedSections.length})</h2>
        {editedSections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === index ? null : index)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-gray-900">
                  #{section.order} - {formatSectionType(section.type)}
                </span>
                <span className="ml-2 text-xs text-gray-500">({section.type})</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === index ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === index && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
                {renderSectionFields(section, index)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatSectionType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/Url$/, ' URL')
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
