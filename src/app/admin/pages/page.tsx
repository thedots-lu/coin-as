'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { PageDocument } from '@/lib/types/page'
import Link from 'next/link'

const expectedPages = [
  { slug: 'home', label: 'Home', route: '/' },
  { slug: 'about', label: 'About', route: '/about' },
  { slug: 'locations', label: 'Locations', route: '/locations' },
  { slug: 'contact', label: 'Contact', route: '/contact' },
  { slug: 'legal', label: 'Legal Notice', route: '/legal-notice' },
  { slug: 'privacy', label: 'Privacy Policy', route: '/privacy-policy' },
  { slug: 'cookies', label: 'Cookies Policy', route: '/cookies-policy' },
]

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPages() {
      try {
        const snapshot = await getDocs(collection(db, 'pages'))
        setPages(snapshot.docs.map((d) => ({ slug: d.id, ...d.data() } as PageDocument)))
      } catch (err) {
        console.error('Error fetching pages:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPages()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const pageMap = new Map(pages.map((p) => [p.slug, p]))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pages</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Page</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sections</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expectedPages.map((ep) => {
              const page = pageMap.get(ep.slug)
              return (
                <tr key={ep.slug} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{ep.label}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{ep.route}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {page ? `${page.sections?.length || 0} sections` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {page ? (
                      <span className="text-xs px-2 py-1 rounded font-medium bg-green-100 text-green-700">
                        In Firestore
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-500">
                        Not found
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {page ? (
                      <div className="flex items-center justify-end gap-3">
                        {ep.slug === 'home' && (
                          <Link
                            href={`/admin/pages/${ep.slug}/visual`}
                            className="text-sm font-medium text-accent-600 hover:text-accent-700"
                          >
                            Visual editor
                          </Link>
                        )}
                        <Link
                          href={`/admin/pages/${ep.slug}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Edit
                        </Link>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">--</span>
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
