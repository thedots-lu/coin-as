'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { dbAdmin as db, storage } from '@/lib/firebase/config'
import { WhitePaper } from '@/lib/types/article'
import { createEmptyLocaleString, LocaleString } from '@/lib/types/locale'
import LocaleEditor from '@/components/admin/LocaleEditor'
import { Upload, FileText, Trash2, Loader2, Download } from 'lucide-react'

const CATEGORIES = [
  { value: 'cyber_resilience', label: 'Cyber Resilience' },
  { value: 'business_continuity', label: 'Business Continuity' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'guide', label: 'Guide' },
]

export default function AdminWhitePapersPage() {
  const [items, setItems] = useState<WhitePaper[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<WhitePaper | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState<LocaleString>(createEmptyLocaleString())
  const [description, setDescription] = useState<LocaleString>(createEmptyLocaleString())
  const [category, setCategory] = useState('business_continuity')
  const [tags, setTags] = useState('')
  const [pages, setPages] = useState('')
  const [published, setPublished] = useState(false)

  // Upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [pdfProgress, setPdfProgress] = useState<number | null>(null)
  const [thumbProgress, setThumbProgress] = useState<number | null>(null)
  const [currentFileUrl, setCurrentFileUrl] = useState('')
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState('')

  const pdfInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const fetchItems = useCallback(async () => {
    try {
      const q = query(collection(db, 'white_papers'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WhitePaper)))
    } catch (err) {
      console.error('Error fetching white papers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const resetForm = () => {
    setTitle(createEmptyLocaleString())
    setDescription(createEmptyLocaleString())
    setCategory('business_continuity')
    setTags('')
    setPages('')
    setPublished(false)
    setPdfFile(null)
    setThumbnailFile(null)
    setPdfProgress(null)
    setThumbProgress(null)
    setCurrentFileUrl('')
    setCurrentThumbnailUrl('')
    if (pdfInputRef.current) pdfInputRef.current.value = ''
    if (thumbInputRef.current) thumbInputRef.current.value = ''
  }

  const startEdit = (item: WhitePaper) => {
    setEditing(item)
    setTitle(item.title)
    setDescription(item.description)
    setCategory(item.category)
    setTags(item.tags.join(', '))
    setPages(item.pages ? String(item.pages) : '')
    setPublished(item.published)
    setCurrentFileUrl(item.fileUrl || '')
    setCurrentThumbnailUrl(item.thumbnailUrl || '')
    setPdfFile(null)
    setThumbnailFile(null)
    setPdfProgress(null)
    setThumbProgress(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setCreating(false)
    resetForm()
  }

  // Upload a file to Firebase Storage and return the download URL
  async function uploadFile(
    file: File,
    path: string,
    onProgress: (pct: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path)
      const task = uploadBytesResumable(storageRef, file)
      task.on(
        'state_changed',
        (snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => {
          const url = await getDownloadURL(task.snapshot.ref)
          resolve(url)
        }
      )
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentFileUrl && !pdfFile) {
      alert('Please upload a PDF file.')
      return
    }
    setSaving(true)
    try {
      const now = Timestamp.now()
      const docId = editing?.id ?? `wp_${Date.now()}`

      let fileUrl = currentFileUrl
      let thumbnailUrl = currentThumbnailUrl || null

      // Upload PDF if a new file was selected
      if (pdfFile) {
        fileUrl = await uploadFile(
          pdfFile,
          `white_papers/${docId}/document.pdf`,
          setPdfProgress
        )
      }

      // Upload thumbnail if a new file was selected
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(
          thumbnailFile,
          `white_papers/${docId}/thumbnail.${thumbnailFile.name.split('.').pop()}`,
          setThumbProgress
        )
      }

      const data = {
        title,
        description,
        category,
        fileUrl,
        thumbnailUrl,
        pages: pages ? parseInt(pages, 10) : null,
        published,
        publishedAt: published ? new Date() : null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        updatedAt: now,
      }

      if (editing) {
        await updateDoc(doc(db, 'white_papers', editing.id), data)
      } else {
        await addDoc(collection(db, 'white_papers'), { ...data, downloadCount: 0, createdAt: now })
      }

      await revalidate('/knowledge-hub')
      await fetchItems()
      handleCancel()
    } catch (err) {
      console.error('Error saving white paper:', err)
      alert('Error saving. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: WhitePaper) => {
    if (!confirm('Delete this white paper? This cannot be undone.')) return
    try {
      // Attempt to remove files from Storage (best-effort)
      if (item.fileUrl) {
        try { await deleteObject(ref(storage, `white_papers/${item.id}/document.pdf`)) } catch { /* ok */ }
      }
      if (item.thumbnailUrl) {
        try { await deleteObject(ref(storage, `white_papers/${item.id}/thumbnail.jpg`)) } catch { /* ok */ }
      }
      await deleteDoc(doc(db, 'white_papers', item.id))
      await revalidate('/knowledge-hub')
      await fetchItems()
    } catch (err) {
      console.error('Error deleting white paper:', err)
    }
  }

  const handleTogglePublished = async (item: WhitePaper) => {
    try {
      await updateDoc(doc(db, 'white_papers', item.id), {
        published: !item.published,
        updatedAt: Timestamp.now(),
      })
      await revalidate('/knowledge-hub')
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

  if (creating || editing) {
    return (
      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editing ? 'Edit White Paper' : 'Add White Paper'}
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

        {/* Category + Pages */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of pages</label>
            <input
              type="number"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="e.g. 24"
            />
          </div>
        </div>

        <LocaleEditor label="Title" value={title} onChange={setTitle} />
        <LocaleEditor label="Description" value={description} onChange={setDescription} multiline rows={4} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="DORA, NIS2, Financial, Compliance"
          />
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF File <span className="text-red-500">*</span>
          </label>
          {currentFileUrl && !pdfFile && (
            <div className="flex items-center gap-2 mb-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Current file saved</span>
              <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="ml-auto underline flex-shrink-0">
                Preview
              </a>
            </div>
          )}
          <div
            onClick={() => pdfInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {pdfFile ? pdfFile.name : 'Click to upload PDF'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF only · Max 20 MB</p>
          </div>
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
          />
          {pdfProgress !== null && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading PDF…</span>
                <span>{pdfProgress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-200"
                  style={{ width: `${pdfProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail <span className="text-gray-400">(optional — JPG/PNG)</span>
          </label>
          {currentThumbnailUrl && !thumbnailFile && (
            <div className="mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentThumbnailUrl} alt="Current thumbnail" className="h-20 rounded-md object-cover border border-gray-200" />
            </div>
          )}
          <div
            onClick={() => thumbInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
          >
            <p className="text-sm text-gray-600">
              {thumbnailFile ? thumbnailFile.name : 'Click to upload thumbnail'}
            </p>
          </div>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
          />
          {thumbProgress !== null && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading thumbnail…</span>
                <span>{thumbProgress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 transition-all duration-200"
                  style={{ width: `${thumbProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
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
        <h1 className="text-2xl font-bold text-gray-900">White Papers</h1>
        <button
          onClick={() => { resetForm(); setCreating(true) }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + Add White Paper
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No white papers yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">PDF</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Downloads</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => {
                const titleText = item.title.en || item.title.fr || '(untitled)'
                const catLabel = CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{titleText}</div>
                      {item.pages && (
                        <div className="text-xs text-gray-400">{item.pages} pages</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{catLabel}</td>
                    <td className="px-4 py-3">
                      {item.fileUrl ? (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                        >
                          <Download className="h-3 w-3" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-xs text-red-500">Missing</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {item.downloadCount ?? 0}
                    </td>
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
                      <button
                        onClick={() => startEdit(item)}
                        className="text-sm text-primary-600 hover:text-primary-700 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                )
              })}
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
