'use client'

import { signOut, User } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  user: User
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut(auth)
    router.push('/admin/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="text-sm text-gray-500">
        Content Management
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded border border-gray-300 hover:border-gray-400 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
