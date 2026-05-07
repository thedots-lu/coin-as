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
  writeBatch,
} from 'firebase/firestore'
import { dbAdmin as db, auth } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { logAudit } from '@/lib/firebase/audit-log'
import { extractYoutubeId } from '@/lib/utils/youtube-id'
import { YoutubeVideoDoc } from '@/lib/types/youtube-video'
import {
  Eye,
  EyeOff,
  Trash2,
  Upload,
  Loader2,
  Plus,
  Pencil,
  X,
  GripVertical,
  Youtube,
  RefreshCcw,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface OembedResult {
  videoId: string
  title: string
  authorName: string
  thumbnail: string
  watchUrl: string
}

async function fetchOembed(url: string): Promise<OembedResult> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  const token = await user.getIdToken()
  const res = await fetch(`/api/youtube-oembed?url=${encodeURIComponent(url)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error || `oEmbed failed (${res.status})`)
  }
  return (await res.json()) as OembedResult
}

export default function AdminVideosPage() {
  const [items, setItems] = useState<YoutubeVideoDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<YoutubeVideoDoc | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Form state
  const [pasteUrl, setPasteUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [title, setTitle] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [visible, setVisible] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const fetchItems = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'youtube_videos'))
      const list = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as YoutubeVideoDoc),
      )
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setItems(list)
    } catch (err) {
      console.error('Error fetching youtube videos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const resetForm = () => {
    setPasteUrl('')
    setVideoId('')
    setTitle('')
    setThumbnail('')
    setPublishedAt('')
    setVisible(true)
    setFetchError(null)
  }

  const startCreate = () => {
    setEditing(null)
    setCreating(true)
    resetForm()
  }

  const startEdit = (item: YoutubeVideoDoc) => {
    setCreating(false)
    setEditing(item)
    setPasteUrl(`https://www.youtube.com/watch?v=${item.videoId}`)
    setVideoId(item.videoId)
    setTitle(item.title)
    setThumbnail(item.thumbnail)
    setPublishedAt(item.publishedAt ?? '')
    setVisible(item.visible !== false)
    setFetchError(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setCreating(false)
    resetForm()
  }

  async function revalidatePublic() {
    try {
      await triggerRevalidate('/resources/videos')
    } catch {
      /* best-effort */
    }
    try {
      await triggerRevalidate('/resources')
    } catch {
      /* best-effort */
    }
  }

  const handleFetchMetadata = async () => {
    if (!pasteUrl.trim()) return
    setFetching(true)
    setFetchError(null)
    try {
      const data = await fetchOembed(pasteUrl.trim())
      setVideoId(data.videoId)
      // Don't clobber editor-overridden title/thumbnail when re-fetching.
      if (!title.trim()) setTitle(data.title)
      if (!thumbnail.trim()) setThumbnail(data.thumbnail)
    } catch (err) {
      console.error('oEmbed fetch failed', err)
      setFetchError(err instanceof Error ? err.message : 'Fetch failed')
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = videoId || extractYoutubeId(pasteUrl)
    if (!id) {
      alert('Please paste a valid YouTube URL and click Fetch metadata.')
      return
    }
    if (!title.trim()) {
      alert('Title is required.')
      return
    }
    setSaving(true)
    try {
      const now = Timestamp.now()
      const payload = {
        videoId: id,
        title: title.trim(),
        thumbnail: thumbnail.trim() || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt: publishedAt.trim() || null,
        visible,
        updatedAt: now,
      }

      if (editing) {
        await updateDoc(doc(db, 'youtube_videos', editing.id), payload)
        await logAudit({
          action: 'update',
          resource: 'youtube_videos',
          resourceId: editing.id,
          label: title.trim(),
        })
      } else {
        const created = await addDoc(collection(db, 'youtube_videos'), {
          ...payload,
          order: items.length,
          createdAt: now,
        })
        await logAudit({
          action: 'create',
          resource: 'youtube_videos',
          resourceId: created.id,
          label: title.trim(),
        })
      }
      await revalidatePublic()
      handleCancel()
      await fetchItems()
    } catch (err) {
      console.error('Save failed:', err)
      alert('Save failed. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: YoutubeVideoDoc) => {
    if (!confirm(`Delete "${item.title}"?`)) return
    try {
      await deleteDoc(doc(db, 'youtube_videos', item.id))
      await logAudit({
        action: 'delete',
        resource: 'youtube_videos',
        resourceId: item.id,
        label: item.title,
      })
      await revalidatePublic()
      await fetchItems()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Delete failed. Check console.')
    }
  }

  const handleToggleVisible = async (item: YoutubeVideoDoc) => {
    try {
      const nextVisible = !(item.visible !== false)
      await updateDoc(doc(db, 'youtube_videos', item.id), {
        visible: nextVisible,
        updatedAt: Timestamp.now(),
      })
      await logAudit({
        action: 'visibility_toggle',
        resource: 'youtube_videos',
        resourceId: item.id,
        label: item.title,
        details: { visible: nextVisible },
      })
      await revalidatePublic()
      await fetchItems()
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)
    setReordering(true)
    try {
      const now = Timestamp.now()
      const batch = writeBatch(db)
      reordered.forEach((item, index) => {
        if (item.order !== index) {
          batch.update(doc(db, 'youtube_videos', item.id), { order: index, updatedAt: now })
        }
      })
      await batch.commit()
      await logAudit({
        action: 'reorder',
        resource: 'youtube_videos',
        details: { order: reordered.map((i) => i.title) },
      })
      await revalidatePublic()
    } catch (err) {
      console.error('Reorder persist failed:', err)
      alert('Reorder failed to save. Refreshing.')
      await fetchItems()
    } finally {
      setReordering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const isFormOpen = creating || !!editing
  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">YouTube videos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Curated videos shown on <code className="px-1 py-0.5 bg-gray-100 rounded">/resources/videos</code>.
            Drag rows to reorder.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add video
          </button>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? `Edit video: ${editing.title}` : 'New video'}
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={pasteUrl}
                    onChange={(e) => setPasteUrl(e.target.value)}
                    required
                    placeholder="https://www.youtube.com/watch?v=…"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={handleFetchMetadata}
                    disabled={fetching || !pasteUrl.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-60"
                  >
                    {fetching ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching…
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="w-3.5 h-3.5" /> Fetch metadata
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Paste any YouTube URL (watch / youtu.be / shorts) and click Fetch to auto-fill the title and thumbnail.
                </p>
                {fetchError && (
                  <p className="text-[11px] text-red-600 mt-1">{fetchError}</p>
                )}
                {videoId && (
                  <p className="text-[11px] text-gray-500 mt-1 font-mono">
                    Video ID: {videoId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Published date
                  </label>
                  <input
                    type="date"
                    value={publishedAt ? publishedAt.slice(0, 10) : ''}
                    onChange={(e) =>
                      setPublishedAt(
                        e.target.value ? new Date(e.target.value).toISOString() : '',
                      )
                    }
                    className={inputClass}
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Optional. Shown as &ldquo;Mmm YYYY&rdquo; on the card.
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-7">
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={(e) => setVisible(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Visible on the public page</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://i.ytimg.com/vi/…/hqdefault.jpg"
                  className={`${inputClass} font-mono text-xs`}
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Auto-filled from oEmbed; falls back to YouTube&apos;s default thumbnail if cleared.
                </p>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
              <div className="aspect-video bg-warm-50 rounded-lg overflow-hidden">
                {thumbnail || videoId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                    alt={title || 'Thumbnail'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Paste a URL & fetch metadata
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 mt-2 line-clamp-2">
                {title || '— title —'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> {editing ? 'Save changes' : 'Create video'}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {!isFormOpen && items.length === 0 && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <Youtube className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm mb-4">
            No videos yet. Use <strong>Add video</strong> to curate one.
          </p>
        </div>
      )}

      {/* Sortable list */}
      {!isFormOpen && items.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
          {reordering && (
            <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 text-[11px] text-gray-600 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving order…
            </div>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-2 py-3"></th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Thumbnail
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <SortableVideoRow
                      key={item.id}
                      item={item}
                      onEdit={() => startEdit(item)}
                      onDelete={() => handleDelete(item)}
                      onToggleVisible={() => handleToggleVisible(item)}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      )}
    </div>
  )
}

interface SortableVideoRowProps {
  item: YoutubeVideoDoc
  onEdit: () => void
  onDelete: () => void
  onToggleVisible: () => void
}

function SortableVideoRow({ item, onEdit, onDelete, onToggleVisible }: SortableVideoRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: isDragging ? '#f3f4f6' : undefined,
  }
  const isHidden = item.visible === false

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isHidden ? 'opacity-60' : ''}`}
    >
      <td className="px-2 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1.5 text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="w-[140px] aspect-video bg-warm-50 rounded overflow-hidden">
          {item.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="font-medium text-gray-900 line-clamp-2">{item.title}</div>
        <div className="text-[11px] text-gray-500 font-mono mt-0.5">{item.videoId}</div>
      </td>
      <td className="px-4 py-3">
        {isHidden ? (
          <span className="text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-600">
            Hidden
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded font-medium bg-green-100 text-green-700">
            Visible
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <a
            href={`https://www.youtube.com/watch?v=${item.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-coin-red-600 hover:bg-coin-red-50 rounded transition-colors"
            title="Open on YouTube"
          >
            <Youtube className="w-4 h-4" />
          </a>
          <button
            onClick={onToggleVisible}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title={isHidden ? 'Show' : 'Hide'}
          >
            {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
