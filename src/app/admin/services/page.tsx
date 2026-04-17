'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore'
import Link from 'next/link'
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { ServiceDocument } from '@/lib/types/service'

export default function AdminServicesPage() {
  const [items, setItems] = useState<ServiceDocument[]>([])
  const [loading, setLoading] = useState(true)

  const fetchServices = useCallback(async () => {
    try {
      const q = query(collection(db, 'services'), orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceDocument)))
    } catch (err) {
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServices() }, [fetchServices])

  const handleDelete = async (item: ServiceDocument) => {
    if (!confirm(`Delete service "${item.title.en}"? This cannot be undone.`)) return
    try {
      await deleteDoc(doc(db, 'services', item.id))
      await revalidate('/services')
      await fetchServices()
    } catch (err) {
      console.error('Error deleting service:', err)
    }
  }

  const handleTogglePublished = async (item: ServiceDocument) => {
    try {
      await updateDoc(doc(db, 'services', item.id), {
        published: !item.published,
        updatedAt: Timestamp.now(),
      })
      await revalidate('/services')
      await fetchServices()
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No services found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sections</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{item.order}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.title.en || item.title.fr}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{item.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.sections?.length || 0}</td>
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
                    <Link
                      href={`/admin/services/${item.slug}`}
                      className="text-sm text-primary-600 hover:text-primary-700 mr-3"
                    >
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(item)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
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

async function revalidate(path: string) {
  try {
    await triggerRevalidate(path)
  } catch { /* best-effort */ }
}
