'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { collection, doc, getDoc, getDocs, updateDoc, Timestamp } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { PageDocument, PageSection } from '@/lib/types/page'
import { LocaleString, createEmptyLocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'
import SectionsEditor from '@/components/admin/SectionsEditor'

export default function AdminPageEditor() {
  const params = useParams()
  const router = useRouter()
  const pageSlug = params.pageSlug as string

  const [page, setPage] = useState<PageDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedSections, setEditedSections] = useState<PageSection[]>([])
  const [editedTitle, setEditedTitle] = useState<LocaleString>(createEmptyLocaleString())
  const [editedBody, setEditedBody] = useState<LocaleString | undefined>(undefined)
  const [editedSeo, setEditedSeo] = useState({
    metaTitle: createEmptyLocaleString(),
    metaDescription: createEmptyLocaleString(),
    ogImage: '' as string | null,
  })

  const load = useCallback(async () => {
    try {
      // If this slug corresponds to a service, redirect to the service admin
      const servicesSnapshot = await getDocs(collection(db, 'services'))
      const serviceSlugs = new Set<string>()
      servicesSnapshot.forEach((d) => {
        const data = d.data() as { slug?: string }
        if (data.slug) serviceSlugs.add(data.slug)
        serviceSlugs.add(d.id)
      })
      if (serviceSlugs.has(pageSlug)) {
        router.replace(`/admin/services/${pageSlug}`)
        return
      }

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
  }, [pageSlug, router])

  useEffect(() => { load() }, [load])

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
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Sections ({editedSections.length})</h2>
        <SectionsEditor sections={editedSections} onChange={setEditedSections} />
      </div>
    </div>
  )
}

async function revalidate(path: string) {
  try {
    await triggerRevalidate(path)
  } catch { /* best-effort */ }
}
