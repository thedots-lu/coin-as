'use client'

import { useEffect, useState } from 'react'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import Link from 'next/link'

interface Stats {
  news: number
  articles: number
  services: number
  partners: number
  team: number
  pages: number
}

const quickActions = [
  { label: 'Manage Pages', href: '/admin/pages', description: 'Edit page content and sections' },
  { label: 'Manage News', href: '/admin/news', description: 'Create and edit news articles' },
  { label: 'Manage Services', href: '/admin/services', description: 'Edit service details' },
  { label: 'Manage Articles', href: '/admin/articles', description: 'Knowledge hub articles' },
  { label: 'Manage Partners', href: '/admin/partners', description: 'Business and tech partners' },
  { label: 'Manage Team', href: '/admin/team', description: 'Team members' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ news: 0, articles: 0, services: 0, partners: 0, team: 0, pages: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const collections = ['news', 'articles', 'services', 'partners', 'team', 'pages'] as const
        const counts = await Promise.all(
          collections.map(async (col) => {
            const snapshot = await getCountFromServer(collection(db, col))
            return snapshot.data().count
          })
        )
        setStats({
          news: counts[0],
          articles: counts[1],
          services: counts[2],
          partners: counts[3],
          team: counts[4],
          pages: counts[5],
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Pages', count: stats.pages, color: 'bg-primary-500' },
    { label: 'News', count: stats.news, color: 'bg-accent-500' },
    { label: 'Articles', count: stats.articles, color: 'bg-secondary-500' },
    { label: 'Services', count: stats.services, color: 'bg-primary-700' },
    { label: 'Partners', count: stats.partners, color: 'bg-accent-700' },
    { label: 'Team Members', count: stats.team, color: 'bg-secondary-700' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white text-lg font-bold mb-3`}>
              {loading ? '-' : card.count}
            </div>
            <p className="text-sm text-gray-600">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
              {action.label}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
