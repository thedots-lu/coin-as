'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { AdminRole } from '@/lib/firebase/roles'
import { Loader2, Shield, ShieldCheck, ShieldOff, AlertTriangle } from 'lucide-react'

interface AdminUser {
  uid: string
  email: string | null
  role: AdminRole | null
  disabled: boolean
  lastSignInAt: string | null
  createdAt: string | null
}

async function authedFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  const token = await user.getIdToken()
  return fetch(input, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function RoleBadge({ role }: { role: AdminRole | null }) {
  if (role === 'superadmin') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded font-medium bg-amber-100 text-amber-800">
        <ShieldCheck className="w-3 h-3" /> Superadmin
      </span>
    )
  }
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded font-medium bg-primary-100 text-primary-800">
        <Shield className="w-3 h-3" /> Admin
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-600">
      No role
    </span>
  )
}

export default function AdminUsersPage() {
  const { user, role, loading: authLoading, isSuperadmin } = useFirebaseAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingUid, setPendingUid] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setError(null)
    try {
      const res = await authedFetch('/api/admin-users')
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const body = (await res.json()) as { users: AdminUser[] }
      const sorted = [...body.users].sort((a, b) => {
        // Show users with a role first, then alphabetically.
        const ra = a.role ? 0 : 1
        const rb = b.role ? 0 : 1
        if (ra !== rb) return ra - rb
        return (a.email ?? '').localeCompare(b.email ?? '')
      })
      setUsers(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isSuperadmin) {
      router.push('/admin')
      return
    }
    fetchUsers()
  }, [authLoading, isSuperadmin, router, fetchUsers])

  const setRole = async (uid: string, nextRole: AdminRole) => {
    setPendingUid(uid)
    setError(null)
    try {
      const res = await authedFetch('/api/admin-users', {
        method: 'POST',
        body: JSON.stringify({ uid, role: nextRole }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setPendingUid(null)
    }
  }

  const revokeRole = async (uid: string, email: string | null) => {
    if (!confirm(`Revoke admin access for ${email ?? uid}?`)) return
    setPendingUid(uid)
    setError(null)
    try {
      const res = await authedFetch('/api/admin-users', {
        method: 'DELETE',
        body: JSON.stringify({ uid }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setPendingUid(null)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isSuperadmin) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-600">
        You need the superadmin role to manage users.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage admin roles. Account creation happens in the{' '}
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            Firebase console
          </a>
          ; once a user has signed in at least once they appear here and can be promoted.
          Users without a role cannot access the admin.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Last sign-in
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => {
                const isSelf = u.uid === user?.uid
                const isBusy = pendingUid === u.uid
                return (
                  <tr key={u.uid} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{u.email ?? '(no email)'}</div>
                      {isSelf && <div className="text-[11px] text-gray-400">You</div>}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(u.lastSignInAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                        {u.role !== 'superadmin' && (
                          <button
                            onClick={() => setRole(u.uid, 'superadmin')}
                            disabled={isBusy}
                            className="text-xs px-2.5 py-1 rounded border border-amber-200 text-amber-800 hover:bg-amber-50 disabled:opacity-50"
                            title="Promote to superadmin"
                          >
                            ↑ Superadmin
                          </button>
                        )}
                        {u.role !== 'admin' && !isSelf && (
                          <button
                            onClick={() => setRole(u.uid, 'admin')}
                            disabled={isBusy}
                            className="text-xs px-2.5 py-1 rounded border border-primary-200 text-primary-800 hover:bg-primary-50 disabled:opacity-50"
                            title={u.role === 'superadmin' ? 'Demote to admin' : 'Grant admin'}
                          >
                            {u.role === 'superadmin' ? '↓ Admin' : 'Grant admin'}
                          </button>
                        )}
                        {u.role && !isSelf && (
                          <button
                            onClick={() => revokeRole(u.uid, u.email)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                            title="Revoke all admin access"
                          >
                            <ShieldOff className="w-3 h-3" /> Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Note: after a role change, the affected user must sign out and sign back in for their
        new permissions to take effect (Firebase ID tokens cache claims for up to an hour).
        {role && ` You are signed in as ${role}.`}
      </p>
    </div>
  )
}
