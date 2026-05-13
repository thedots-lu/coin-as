'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import Link from 'next/link'
import { GripVertical, Loader2 } from 'lucide-react'
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
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { logAudit } from '@/lib/firebase/audit-log'
import { ServiceDocument } from '@/lib/types/service'

// Dev-curated list of service pages exposed in the admin. Devs add a
// new entry here AND create the matching Firestore doc when shipping a
// new service page; the admin can then enable / disable / delete it
// without touching code. Order here drives the order in the Services
// submenu (the Firestore `order` field still wins for sorting, but
// this list documents the canonical set).
const KNOWN_SERVICES = [
  { slug: 'overview', label: 'Overview', route: '/services' },
  { slug: 'recovery-workplaces', label: 'Recovery Workplaces' },
  { slug: 'consultancy-and-training', label: 'Consultancy and Training' },
  { slug: 'it-housing', label: 'IT Housing' },
  { slug: 'cyberresilience', label: 'Cyber Resilience' },
  { slug: 'crisis-management', label: 'Crisis Management' },
] as const

type Row = {
  slug: string
  label: string
  route: string
  service: ServiceDocument | null
}

export default function AdminServicesPage() {
  const [overviewRow, setOverviewRow] = useState<Row | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const fetchServices = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'services'))
      const byId = new Map(
        snapshot.docs.map((d) => [d.id, { id: d.id, ...d.data() } as ServiceDocument]),
      )
      const all: Row[] = KNOWN_SERVICES.map((entry) => ({
        slug: entry.slug,
        label: entry.label,
        route: 'route' in entry && entry.route ? entry.route : `/services/${entry.slug}`,
        service: byId.get(entry.slug) ?? null,
      }))
      const overview = all.find((r) => r.slug === 'overview') ?? null
      const others = all
        .filter((r) => r.slug !== 'overview')
        .sort((a, b) => {
          const ao = a.service?.order ?? Number.MAX_SAFE_INTEGER
          const bo = b.service?.order ?? Number.MAX_SAFE_INTEGER
          if (ao !== bo) return ao - bo
          return (
            KNOWN_SERVICES.findIndex((k) => k.slug === a.slug) -
            KNOWN_SERVICES.findIndex((k) => k.slug === b.slug)
          )
        })
      setOverviewRow(overview)
      setRows(others)
    } catch (err) {
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleTogglePublished = async (row: Row) => {
    if (!row.service) return
    try {
      const nextPublished = !row.service.published
      await updateDoc(doc(db, 'services', row.service.id), {
        published: nextPublished,
        updatedAt: Timestamp.now(),
      })
      await logAudit({
        action: 'visibility_toggle',
        resource: 'services',
        resourceId: row.service.id,
        label: row.label,
        details: { published: nextPublished },
      })
      await revalidateLayout()
      await revalidate('/services')
      if (row.slug !== 'overview') await revalidate(`/services/${row.slug}`)
      await fetchServices()
    } catch (err) {
      console.error('Error toggling published:', err)
      alert('Could not update status. Check console.')
    }
  }

  const handleDelete = async (row: Row) => {
    if (!row.service) return
    if (row.slug === 'overview') {
      alert('The Overview page cannot be deleted from the UI.')
      return
    }
    if (
      !confirm(
        `Delete service "${row.label}"? This removes the Firestore doc and its menu entry. The page will 404 until a dev recreates the doc. This cannot be undone.`,
      )
    )
      return
    try {
      await deleteDoc(doc(db, 'services', row.service.id))
      await logAudit({
        action: 'delete',
        resource: 'services',
        resourceId: row.service.id,
        label: row.label,
      })
      await revalidateLayout()
      await revalidate('/services')
      await revalidate(`/services/${row.slug}`)
      await fetchServices()
    } catch (err) {
      console.error('Error deleting service:', err)
      alert('Could not delete. Check console.')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = rows.findIndex((r) => r.slug === active.id)
    const newIndex = rows.findIndex((r) => r.slug === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(rows, oldIndex, newIndex)
    setRows(reordered)
    setReordering(true)
    try {
      const now = Timestamp.now()
      const batch = writeBatch(db)
      // Reserve order=0 for the Overview entry so it always sorts first.
      reordered.forEach((row, index) => {
        if (!row.service) return
        const desiredOrder = index + 1
        if (row.service.order !== desiredOrder) {
          batch.update(doc(db, 'services', row.service.id), {
            order: desiredOrder,
            updatedAt: now,
          })
        }
      })
      await batch.commit()
      await logAudit({
        action: 'reorder',
        resource: 'services',
        details: { order: reordered.map((r) => r.slug) },
      })
      await revalidateLayout()
      await revalidate('/services')
      await fetchServices()
    } catch (err) {
      console.error('Reorder persist failed:', err)
      alert('Reorder failed to save. Refreshing.')
      await fetchServices()
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md px-4 py-3 mb-4">
        Service pages are shipped by developers. Use the controls below to
        publish, unpublish, or remove them. Publishing a service adds it to the
        Services menu automatically. Drag rows to reorder; Overview stays
        pinned first.
      </div>

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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sections</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {overviewRow && (
                <ServiceRow
                  row={overviewRow}
                  pinned
                  onTogglePublished={() => handleTogglePublished(overviewRow)}
                  onDelete={() => handleDelete(overviewRow)}
                />
              )}
              <SortableContext
                items={rows.map((r) => r.slug)}
                strategy={verticalListSortingStrategy}
              >
                {rows.map((row) => (
                  <SortableServiceRow
                    key={row.slug}
                    row={row}
                    onTogglePublished={() => handleTogglePublished(row)}
                    onDelete={() => handleDelete(row)}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  )
}

interface ServiceRowProps {
  row: Row
  pinned?: boolean
  onTogglePublished: () => void
  onDelete: () => void
}

function ServiceRow({ row, pinned, onTogglePublished, onDelete }: ServiceRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-2 py-3 text-center">
        <span className="inline-flex items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          {pinned ? 'Pinned' : ''}
        </span>
      </td>
      <ServiceRowCells row={row} onTogglePublished={onTogglePublished} onDelete={onDelete} />
    </tr>
  )
}

function SortableServiceRow({ row, onTogglePublished, onDelete }: ServiceRowProps) {
  const draggable = !!row.service
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.slug,
    disabled: !draggable,
  })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: isDragging ? '#f3f4f6' : undefined,
  }
  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-2 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={!draggable}
          className="p-1.5 text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing touch-none disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Drag to reorder"
          title={draggable ? 'Drag to reorder' : 'Cannot reorder until the service exists in the DB'}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <ServiceRowCells row={row} onTogglePublished={onTogglePublished} onDelete={onDelete} />
    </tr>
  )
}

function ServiceRowCells({
  row,
  onTogglePublished,
  onDelete,
}: {
  row: Row
  onTogglePublished: () => void
  onDelete: () => void
}) {
  const isOverview = row.slug === 'overview'
  const status = !row.service
    ? { label: 'Not in DB', tone: 'bg-gray-100 text-gray-500' }
    : row.service.published
      ? { label: 'Published', tone: 'bg-green-100 text-green-700' }
      : { label: 'Draft', tone: 'bg-yellow-100 text-yellow-700' }

  return (
    <>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.label}</td>
      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{row.route}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {row.service ? `${row.service.sections?.length || 0} sections` : '-'}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded font-medium ${status.tone}`}>{status.label}</span>
      </td>
      <td className="px-4 py-3 text-right">
        {row.service ? (
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/admin/services/${row.slug}/visual`}
              className="text-sm font-medium text-accent-600 hover:text-accent-700"
            >
              Visual editor
            </Link>
            <Link
              href={`/admin/services/${row.slug}`}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Edit
            </Link>
            <button
              onClick={onTogglePublished}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {row.service.published ? 'Unpublish' : 'Publish'}
            </button>
            {!isOverview && (
              <button onClick={onDelete} className="text-sm text-red-600 hover:text-red-700">
                Delete
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Awaiting dev</span>
        )}
      </td>
    </>
  )
}

async function revalidate(path: string, type: 'page' | 'layout' = 'page') {
  try {
    await triggerRevalidate(path, type)
  } catch {
    /* best-effort */
  }
}

/**
 * Services mutations always affect the marketing layout: the nav menu's
 * Services dropdown is derived from the published services collection, so
 * adding / removing / renaming / publishing any service must cascade to
 * every page underneath the layout. Call this from every mutation handler.
 */
async function revalidateLayout() {
  await revalidate('/', 'layout')
}
