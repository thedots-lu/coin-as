'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { uploadFile, deleteFile } from '@/lib/firebase/upload'
import { CustomerLogo } from '@/lib/types/customer-logo'
import { DEFAULT_CUSTOMER_LOGOS } from '@/lib/defaults/customer-logos'
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

export default function AdminCustomerLogosPage() {
  const [items, setItems] = useState<CustomerLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<CustomerLogo | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [reordering, setReordering] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [visible, setVisible] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const fetchItems = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'customer_logos'))
      const list = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as CustomerLogo),
      )
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setItems(list)
    } catch (err) {
      console.error('Error fetching customer logos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const resetForm = () => {
    setName('')
    setVisible(true)
    setImageFile(null)
    setCurrentImageUrl('')
    setProgress(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const startCreate = () => {
    setEditing(null)
    setCreating(true)
    resetForm()
  }

  const startEdit = (item: CustomerLogo) => {
    setCreating(false)
    setEditing(item)
    setName(item.name)
    setVisible(item.visible !== false)
    setImageFile(null)
    setCurrentImageUrl(item.imageUrl || '')
    setProgress(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setCreating(false)
    resetForm()
  }

  async function revalidateHome() {
    try {
      await triggerRevalidate('/')
    } catch {
      /* best-effort */
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentImageUrl && !imageFile) {
      alert('Please upload a logo image.')
      return
    }
    if (!name.trim()) {
      alert('Please enter a name.')
      return
    }
    setSaving(true)
    try {
      const now = Timestamp.now()
      let imageUrl = currentImageUrl

      if (imageFile) {
        const docId = editing?.id ?? `logo_${Date.now()}`
        const ext = imageFile.name.split('.').pop() || 'png'
        imageUrl = await uploadFile(imageFile, `customer_logos/${docId}/logo.${ext}`, setProgress)
      }

      if (editing) {
        await updateDoc(doc(db, 'customer_logos', editing.id), {
          name: name.trim(),
          imageUrl,
          visible,
          updatedAt: now,
        })
        // If the image was replaced, drop the old object from R2
        if (editing.imageUrl && editing.imageUrl !== imageUrl) {
          await deleteFile(editing.imageUrl)
        }
      } else {
        await addDoc(collection(db, 'customer_logos'), {
          name: name.trim(),
          imageUrl,
          order: items.length, // append at end; user can DnD to reorder
          visible,
          createdAt: now,
          updatedAt: now,
        })
      }

      await revalidateHome()
      handleCancel()
      await fetchItems()
    } catch (err) {
      console.error('Save failed:', err)
      alert('Save failed. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: CustomerLogo) => {
    if (!confirm(`Delete "${item.name}"?`)) return
    try {
      await deleteDoc(doc(db, 'customer_logos', item.id))
      if (item.imageUrl) await deleteFile(item.imageUrl)
      await revalidateHome()
      await fetchItems()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Delete failed. Check console.')
    }
  }

  const handleToggleVisible = async (item: CustomerLogo) => {
    try {
      await updateDoc(doc(db, 'customer_logos', item.id), {
        visible: !(item.visible !== false),
        updatedAt: Timestamp.now(),
      })
      await revalidateHome()
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
    // Optimistic: update UI immediately
    setItems(reordered)
    setReordering(true)

    try {
      const now = Timestamp.now()
      const batch = writeBatch(db)
      reordered.forEach((item, index) => {
        if (item.order !== index) {
          batch.update(doc(db, 'customer_logos', item.id), { order: index, updatedAt: now })
        }
      })
      await batch.commit()
      await revalidateHome()
    } catch (err) {
      console.error('Reorder persist failed:', err)
      alert('Reorder failed to save. Refreshing.')
      await fetchItems()
    } finally {
      setReordering(false)
    }
  }

  const handleSeedDefaults = async () => {
    if (
      !confirm(
        `Seed ${DEFAULT_CUSTOMER_LOGOS.length} default logos into Firestore? This appends to existing logos.`,
      )
    )
      return
    setSeeding(true)
    try {
      const now = Timestamp.now()
      const startOrder = items.length
      await Promise.all(
        DEFAULT_CUSTOMER_LOGOS.map((logo, i) =>
          addDoc(collection(db, 'customer_logos'), {
            name: logo.name,
            imageUrl: logo.imageUrl,
            order: startOrder + i,
            visible: true,
            createdAt: now,
            updatedAt: now,
          }),
        ),
      )
      await revalidateHome()
      await fetchItems()
    } catch (err) {
      console.error('Seed failed:', err)
      alert('Seed failed. Check console.')
    } finally {
      setSeeding(false)
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Logos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Logos shown in the &quot;Trusted by&quot; marquee on the homepage. Drag rows to
            reorder.
          </p>
        </div>
        {!isFormOpen && (
          <div className="flex items-center gap-2">
            {items.length === 0 && (
              <button
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-60"
              >
                {seeding ? 'Seeding…' : 'Initialize from defaults'}
              </button>
            )}
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add logo
            </button>
          </div>
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
              {editing ? `Edit logo: ${editing.name}` : 'New logo'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Generali"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Used as alt text and in this admin list. Not displayed on the site.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Show on homepage</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {progress !== null && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading… {progress}%
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
              <div className="flex items-center justify-center w-full h-[160px] bg-warm-50 rounded-lg p-4">
                <div className="flex items-center justify-center w-[220px] h-[130px] bg-white rounded-2xl shadow-sm px-6">
                  {currentImageUrl || imageFile ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : currentImageUrl}
                      alt="Preview"
                      className="max-h-[90px] max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </div>
              </div>
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
                  <Upload className="w-4 h-4" /> {editing ? 'Save changes' : 'Create logo'}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {!isFormOpen && items.length === 0 && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600 text-sm mb-4">
            No customer logos in Firestore yet. Click <strong>Initialize from defaults</strong>{' '}
            to seed the {DEFAULT_CUSTOMER_LOGOS.length} existing logos, or use{' '}
            <strong>Add logo</strong> to start fresh.
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
                    Logo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Name
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
                    <SortableLogoRow
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

interface SortableLogoRowProps {
  item: CustomerLogo
  onEdit: () => void
  onDelete: () => void
  onToggleVisible: () => void
}

function SortableLogoRow({ item, onEdit, onDelete, onToggleVisible }: SortableLogoRowProps) {
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
        <div className="flex items-center justify-center w-[120px] h-[60px] bg-warm-50 rounded-lg">
          <div className="flex items-center justify-center w-full h-full bg-white rounded-md px-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="max-h-[40px] max-w-full object-contain"
            />
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
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
