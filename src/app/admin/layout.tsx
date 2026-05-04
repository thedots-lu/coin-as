'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, isSuperadmin } = useFirebaseAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/admin/login'
  const authorized = !!user && !!role

  useEffect(() => {
    if (loading || isLoginPage) return
    if (!user) {
      router.push('/admin/login')
      return
    }
    if (!role) {
      // Authenticated but no admin role — sign out and bounce to login.
      signOut(auth).finally(() => router.push('/admin/login'))
    }
  }, [user, role, loading, router, isLoginPage])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (isLoginPage) return <>{children}</>

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isSuperadmin={isSuperadmin} />
      <div className="ml-64">
        <AdminHeader user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
