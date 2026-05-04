'use client'

import { useState, useEffect } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { AdminRole, roleFromClaims } from '@/lib/firebase/roles'

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<AdminRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (next) => {
      setUser(next)
      if (next) {
        try {
          const result = await next.getIdTokenResult()
          setRole(roleFromClaims(result.claims))
        } catch {
          setRole(null)
        }
      } else {
        setRole(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return { user, role, loading, isSuperadmin: role === 'superadmin' }
}
