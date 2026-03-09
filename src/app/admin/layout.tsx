'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebaseAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // Login page - no sidebar/header
  if (!user && pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64">
        <AdminHeader user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
