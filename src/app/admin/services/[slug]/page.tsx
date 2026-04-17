'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { ServiceDocument } from '@/lib/types/service'
import { PageSection } from '@/lib/types/page'
import { LocaleString, createEmptyLocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'
import SectionsEditor from '@/components/admin/SectionsEditor'

export default function AdminServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [service, setService] = useState<ServiceDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editTitle, setEditTitle] = useState<LocaleString>(createEmptyLocaleString())
  const [editShortTitle, setEditShortTitle] = useState<LocaleString>(createEmptyLocaleString())
  const [editCategory, setEditCategory] = useState<'consulting' | 'centers' | 'cyber'>('consulting')
  const [editOrder, setEditOrder] = useState(0)
  const [editPublished, setEditPublished] = useState(false)
  const [editOverview, setEditOverview] = useState<LocaleString>(createEmptyLocaleString())
  const [editHeroSubtitle, setEditHeroSubtitle] = useState<LocaleString>(createEmptyLocaleString())
  const [editHeroImageUrl, setEditHeroImageUrl] = useState<string>('')
  const [editSections, setEditSections] = useState<PageSection[]>([])
  const [editSeo, setEditSeo] = useState({
    metaTitle: createEmptyLocaleString(),
    metaDescription: createEmptyLocaleString(),
    ogImage: '' as string | null,
  })

  const fetchService = useCallback(async () => {
    try {
      const docRef = doc(db, 'services', slug)
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as ServiceDocument
        setService(data)
        setEditTitle(data.title)
        setEditShortTitle(data.shortTitle)
        setEditCategory(data.category)
        setEditOrder(data.order)
        setEditPublished(data.published)
        setEditOverview(data.overview)
        setEditHeroSubtitle(data.heroSubtitle)
        setEditHeroImageUrl(data.heroImageUrl || '')
        setEditSections(data.sections || [])
        setEditSeo({
          metaTitle: data.seo?.metaTitle || createEmptyLocaleString(),
          metaDescription: data.seo?.metaDescription || createEmptyLocaleString(),
          ogImage: data.seo?.ogImage || null,
        })
      }
    } catch (err) {
      console.error('Error fetching service:', err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetchService() }, [fetchService])

  const handleSave = async () => {
    if (!service) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'services', service.id), {
        title: editTitle,
        shortTitle: editShortTitle,
        category: editCategory,
        order: editOrder,
        published: editPublished,
        overview: editOverview,
        heroSubtitle: editHeroSubtitle,
        heroImageUrl: editHeroImageUrl || null,
        sections: editSections,
        seo: editSeo,
        updatedAt: Timestamp.now(),
      })
      await revalidate('/services')
      await revalidate(`/services/${service.slug}`)
      alert('Service saved successfully.')
    } catch (err) {
      console.error('Error saving service:', err)
      alert('Error saving service. Check console.')
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

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Service &quot;{slug}&quot; not found in Firestore.</p>
        <button
          onClick={() => router.push('/admin/services')}
          className="mt-4 text-sm text-primary-600 hover:text-primary-700"
        >
          Back to Services
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.push('/admin/services')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            &larr; Back to Services
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Service: {service.slug}</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Service'}
        </button>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>
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

        <div className="grid grid-cols-2 gap-4 mb-4">
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

        <div className="space-y-4">
          <LocaleEditor label="Title" value={editTitle} onChange={setEditTitle} />
          <LocaleEditor label="Short Title" value={editShortTitle} onChange={setEditShortTitle} />
          <LocaleEditor label="Hero Subtitle" value={editHeroSubtitle} onChange={setEditHeroSubtitle} multiline rows={3} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
            <input
              type="text"
              value={editHeroImageUrl}
              onChange={(e) => setEditHeroImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <LocaleEditor label="Overview" value={editOverview} onChange={setEditOverview} multiline rows={6} />
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
        <div className="space-y-4">
          <LocaleEditor label="Meta Title" value={editSeo.metaTitle} onChange={(v) => setEditSeo({ ...editSeo, metaTitle: v })} />
          <LocaleEditor label="Meta Description" value={editSeo.metaDescription} onChange={(v) => setEditSeo({ ...editSeo, metaDescription: v })} multiline />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
            <input
              type="text"
              value={editSeo.ogImage || ''}
              onChange={(e) => setEditSeo({ ...editSeo, ogImage: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Sections ({editSections.length})</h2>
        <SectionsEditor sections={editSections} onChange={setEditSections} />
      </div>
    </div>
  )
}

async function revalidate(path: string) {
  try {
    await triggerRevalidate(path)
  } catch { /* best-effort */ }
}
