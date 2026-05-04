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
import { logAudit } from '@/lib/firebase/audit-log'
import { Site } from '@/lib/types/site'
import { Locale, LocaleString, createEmptyLocaleString } from '@/lib/types/locale'
import RichTextEditor from '@/components/admin/RichTextEditor'
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

const LOCALES: Locale[] = ['en', 'fr', 'nl']
const COLOR_PRESETS = ['#004779', '#A51218', '#009900', '#0a8a3a', '#475569']

function emptySiteForm(): {
  name: LocaleString
  country: LocaleString
  description: LocaleString
  capacity: LocaleString
  address: string
  phone: string
  mapUrl: string
  color: string
  imageUrl: string
  officeImageUrl: string
  visible: boolean
} {
  return {
    name: createEmptyLocaleString(),
    country: createEmptyLocaleString(),
    description: createEmptyLocaleString(),
    capacity: createEmptyLocaleString(),
    address: '',
    phone: '',
    mapUrl: '',
    color: COLOR_PRESETS[0],
    imageUrl: '',
    officeImageUrl: '',
    visible: true,
  }
}

export default function AdminSitesPage() {
  const [items, setItems] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Site | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [activeLocale, setActiveLocale] = useState<Locale>('en')
  const [form, setForm] = useState(emptySiteForm())
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [officeImageFile, setOfficeImageFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const officeFileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const fetchItems = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'sites'))
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Site))
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setItems(list)
    } catch (err) {
      console.error('Error fetching sites:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const startCreate = () => {
    setEditing(null)
    setCreating(true)
    setForm(emptySiteForm())
    setImageFile(null)
    setOfficeImageFile(null)
    setProgress(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (officeFileInputRef.current) officeFileInputRef.current.value = ''
  }

  const startEdit = (item: Site) => {
    setCreating(false)
    setEditing(item)
    setForm({
      name: item.name ?? createEmptyLocaleString(),
      country: item.country ?? createEmptyLocaleString(),
      description: item.description ?? createEmptyLocaleString(),
      capacity: item.capacity ?? createEmptyLocaleString(),
      address: item.address ?? '',
      phone: item.phone ?? '',
      mapUrl: item.mapUrl ?? '',
      color: item.color ?? COLOR_PRESETS[0],
      imageUrl: item.imageUrl ?? '',
      officeImageUrl: item.officeImageUrl ?? '',
      visible: item.visible !== false,
    })
    setImageFile(null)
    setOfficeImageFile(null)
    setProgress(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setCreating(false)
    setForm(emptySiteForm())
    setImageFile(null)
    setOfficeImageFile(null)
    setProgress(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (officeFileInputRef.current) officeFileInputRef.current.value = ''
  }

  async function revalidateAffectedPages() {
    try {
      await triggerRevalidate('/about')
    } catch {
      /* best-effort */
    }
    try {
      await triggerRevalidate('/locations')
    } catch {
      /* best-effort */
    }
  }

  const updateLocaleField = (
    field: 'name' | 'country' | 'description' | 'capacity',
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [activeLocale]: value },
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.imageUrl && !imageFile) {
      alert('Please upload an image for this site.')
      return
    }
    if (!form.name.en?.trim()) {
      alert('Please fill the EN name.')
      return
    }
    setSaving(true)
    try {
      const now = Timestamp.now()
      const docIdForUpload = editing?.id ?? `site_${Date.now()}`
      let imageUrl = form.imageUrl
      let officeImageUrl = form.officeImageUrl

      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'jpg'
        imageUrl = await uploadFile(
          imageFile,
          `sites/${docIdForUpload}/building-${Date.now()}.${ext}`,
          setProgress,
        )
      }

      if (officeImageFile) {
        const ext = officeImageFile.name.split('.').pop() || 'jpg'
        officeImageUrl = await uploadFile(
          officeImageFile,
          `sites/${docIdForUpload}/office-${Date.now()}.${ext}`,
          setProgress,
        )
      }

      const payload = {
        name: form.name,
        country: form.country,
        description: form.description,
        capacity: form.capacity,
        address: form.address.trim(),
        phone: form.phone.trim(),
        mapUrl: form.mapUrl.trim(),
        color: form.color,
        imageUrl,
        officeImageUrl,
        visible: form.visible,
        updatedAt: now,
      }

      const labelForLog = form.name.en || form.name.fr || form.name.nl || '(unnamed)'
      if (editing) {
        await updateDoc(doc(db, 'sites', editing.id), payload)
        if (editing.imageUrl && editing.imageUrl !== imageUrl) {
          await deleteFile(editing.imageUrl)
        }
        if (editing.officeImageUrl && editing.officeImageUrl !== officeImageUrl) {
          await deleteFile(editing.officeImageUrl)
        }
        await logAudit({
          action: 'update',
          resource: 'sites',
          resourceId: editing.id,
          label: labelForLog,
        })
      } else {
        const created = await addDoc(collection(db, 'sites'), {
          ...payload,
          order: items.length,
          createdAt: now,
        })
        await logAudit({
          action: 'create',
          resource: 'sites',
          resourceId: created.id,
          label: labelForLog,
        })
      }

      await revalidateAffectedPages()
      handleCancel()
      await fetchItems()
    } catch (err) {
      console.error('Save failed:', err)
      alert('Save failed. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: Site) => {
    const label = item.name?.en || item.name?.fr || item.name?.nl || '(unnamed)'
    if (!confirm(`Delete "${label}"?`)) return
    try {
      await deleteDoc(doc(db, 'sites', item.id))
      if (item.imageUrl) await deleteFile(item.imageUrl)
      if (item.officeImageUrl) await deleteFile(item.officeImageUrl)
      await logAudit({ action: 'delete', resource: 'sites', resourceId: item.id, label })
      await revalidateAffectedPages()
      await fetchItems()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Delete failed. Check console.')
    }
  }

  const handleToggleVisible = async (item: Site) => {
    try {
      const nextVisible = !(item.visible !== false)
      await updateDoc(doc(db, 'sites', item.id), {
        visible: nextVisible,
        updatedAt: Timestamp.now(),
      })
      await logAudit({
        action: 'visibility_toggle',
        resource: 'sites',
        resourceId: item.id,
        label: item.name?.en || item.name?.fr || item.name?.nl || '(unnamed)',
        details: { visible: nextVisible },
      })
      await revalidateAffectedPages()
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
          batch.update(doc(db, 'sites', item.id), { order: index, updatedAt: now })
        }
      })
      await batch.commit()
      await logAudit({
        action: 'reorder',
        resource: 'sites',
        details: {
          order: reordered.map((s) => s.name?.en || s.id),
        },
      })
      await revalidateAffectedPages()
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
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-sm text-gray-500 mt-1">
            Business continuity centres shown on the About page (Our Locations) and the
            Locations page. Drag rows to reorder.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add site
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
              {editing ? `Edit site: ${editing.name?.en || '(unnamed)'}` : 'New site'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1 bg-gray-100 rounded-md p-1">
                {LOCALES.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setActiveLocale(loc)}
                    className={`px-3 py-1 text-xs font-semibold uppercase rounded transition-colors ${
                      activeLocale === loc
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name ({activeLocale.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={form.name[activeLocale] ?? ''}
                    onChange={(e) => updateLocaleField('name', e.target.value)}
                    placeholder="e.g. Amsterdam"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country ({activeLocale.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={form.country[activeLocale] ?? ''}
                    onChange={(e) => updateLocaleField('country', e.target.value)}
                    placeholder="e.g. Netherlands"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="e.g. Schiphol-Rijk"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+31 88 …"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity ({activeLocale.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={form.capacity[activeLocale] ?? ''}
                  onChange={(e) => updateLocaleField('capacity', e.target.value)}
                  placeholder="e.g. 250 recovery workplaces · Crisis rooms"
                  className={inputClass}
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Short feature line shown on both compact and full cards.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description ({activeLocale.toUpperCase()})
                </label>
                <RichTextEditor
                  key={`${editing?.id ?? 'new'}-description-${activeLocale}`}
                  value={form.description[activeLocale] ?? ''}
                  onChange={(html) =>
                    setForm((p) => ({
                      ...p,
                      description: { ...p.description, [activeLocale]: html },
                    }))
                  }
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Long description shown on the dedicated Locations page.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Map URL</label>
                <input
                  type="url"
                  value={form.mapUrl}
                  onChange={(e) => setForm((p) => ({ ...p, mapUrl: e.target.value }))}
                  placeholder="https://maps.google.com/?q=…"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accent colour
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, color: preset }))}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        form.color === preset
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ background: preset }}
                      aria-label={`Pick ${preset}`}
                    />
                  ))}
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                    className={`${inputClass} ml-2 max-w-[120px]`}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Visible on the public site</span>
              </label>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Building image
                  <span className="block text-[11px] font-normal text-gray-500 mt-0.5">
                    Exterior shot — used on the About page compact card.
                  </span>
                </label>
                <div className="flex items-center justify-center w-full aspect-[4/3] bg-warm-50 rounded-lg overflow-hidden">
                  {form.imageUrl || imageFile ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl}
                      alt="Building preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Office image
                  <span className="block text-[11px] font-normal text-gray-500 mt-0.5">
                    Interior shot — used on the Locations page gallery.
                    Falls back to the building image if missing.
                  </span>
                </label>
                <div className="flex items-center justify-center w-full aspect-[4/3] bg-warm-50 rounded-lg overflow-hidden">
                  {form.officeImageUrl || officeImageFile ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        officeImageFile
                          ? URL.createObjectURL(officeImageFile)
                          : form.officeImageUrl
                      }
                      alt="Office preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No image (falls back to building)</span>
                  )}
                </div>
                <input
                  ref={officeFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setOfficeImageFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>

              {progress !== null && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading… {progress}%
                </div>
              )}
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
                  <Upload className="w-4 h-4" /> {editing ? 'Save changes' : 'Create site'}
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
            No sites yet. Use <strong>Add site</strong> to create one.
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
                    Image
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Country
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
                    <SortableSiteRow
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

interface SortableSiteRowProps {
  item: Site
  onEdit: () => void
  onDelete: () => void
  onToggleVisible: () => void
}

function SortableSiteRow({ item, onEdit, onDelete, onToggleVisible }: SortableSiteRowProps) {
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
  const name = item.name?.en || item.name?.fr || item.name?.nl || '(unnamed)'
  const country = item.country?.en || item.country?.fr || item.country?.nl || ''

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
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="w-[80px] h-[60px] bg-warm-50 rounded overflow-hidden">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{country}</td>
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
