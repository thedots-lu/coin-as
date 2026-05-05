'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import Link from 'next/link'
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
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  const fetchServices = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'services'))
      const byId = new Map(
        snapshot.docs.map((d) => [d.id, { id: d.id, ...d.data() } as ServiceDocument]),
      )
      setRows(
        KNOWN_SERVICES.map((entry) => ({
          slug: entry.slug,
          label: entry.label,
          route: 'route' in entry && entry.route ? entry.route : `/services/${entry.slug}`,
          service: byId.get(entry.slug) ?? null,
        })),
      )
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
      await revalidate('/services')
      await revalidate(`/services/${row.slug}`)
      await fetchServices()
    } catch (err) {
      console.error('Error deleting service:', err)
      alert('Could not delete. Check console.')
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
        Services menu automatically.
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sections</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row) => {
              const isOverview = row.slug === 'overview'
              const status = !row.service
                ? { label: 'Not in DB', tone: 'bg-gray-100 text-gray-500' }
                : row.service.published
                  ? { label: 'Published', tone: 'bg-green-100 text-green-700' }
                  : { label: 'Draft', tone: 'bg-yellow-100 text-yellow-700' }

              return (
                <tr key={row.slug} className="hover:bg-gray-50">
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
                          onClick={() => handleTogglePublished(row)}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          {row.service.published ? 'Unpublish' : 'Publish'}
                        </button>
                        {!isOverview && (
                          <button
                            onClick={() => handleDelete(row)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Awaiting dev</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

async function revalidate(path: string) {
  try {
    await triggerRevalidate(path)
  } catch {
    /* best-effort */
  }
}
