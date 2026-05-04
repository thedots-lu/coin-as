'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { AdminRole } from '@/lib/firebase/roles'
import { AuditAction, AuditLogEntry } from '@/lib/types/audit-log'
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react'

const PAGE_SIZE = 100

const ACTION_LABELS: Record<AuditAction, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  reorder: 'Reordered',
  visibility_toggle: 'Visibility',
  upload: 'Uploaded',
  remove_file: 'Removed file',
}

const ACTION_COLORS: Record<AuditAction, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  reorder: 'bg-purple-100 text-purple-800',
  visibility_toggle: 'bg-amber-100 text-amber-800',
  upload: 'bg-teal-100 text-teal-800',
  remove_file: 'bg-rose-100 text-rose-800',
}

function formatTimestamp(ts: Timestamp | null | undefined): string {
  if (!ts) return '—'
  const d = ts.toDate()
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function docToEntry(d: QueryDocumentSnapshot<DocumentData>): AuditLogEntry {
  const data = d.data()
  return {
    id: d.id,
    uid: data.uid as string,
    email: (data.email as string | null) ?? null,
    role: data.role as AdminRole,
    action: data.action as AuditAction,
    resource: data.resource as string,
    resourceId: data.resourceId as string | undefined,
    label: data.label as string | undefined,
    details: data.details as Record<string, unknown> | undefined,
    timestamp: data.timestamp as Timestamp,
    expiresAt: data.expiresAt as Timestamp,
  }
}

export default function AdminAuditLogPage() {
  const { loading: authLoading, isSuperadmin } = useFirebaseAuth()
  const router = useRouter()

  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const [actorFilter, setActorFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')

  const fetchPage = useCallback(
    async (after: QueryDocumentSnapshot<DocumentData> | null) => {
      const constraints = [orderBy('timestamp', 'desc'), limit(PAGE_SIZE + 1)]
      const q = after
        ? query(collection(db, 'audit_logs'), ...constraints, startAfter(after))
        : query(collection(db, 'audit_logs'), ...constraints)
      const snap = await getDocs(q)
      const docs = snap.docs
      const more = docs.length > PAGE_SIZE
      const slice = more ? docs.slice(0, PAGE_SIZE) : docs
      return {
        page: slice.map(docToEntry),
        nextCursor: slice.length > 0 ? slice[slice.length - 1] : null,
        hasMore: more,
      }
    },
    [],
  )

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { page, nextCursor, hasMore: more } = await fetchPage(null)
      setEntries(page)
      setCursor(nextCursor)
      setHasMore(more)
      setExpanded(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }, [fetchPage])

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    setError(null)
    try {
      const { page, nextCursor, hasMore: more } = await fetchPage(cursor)
      setEntries((prev) => [...prev, ...page])
      setCursor(nextCursor)
      setHasMore(more)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      setLoadingMore(false)
    }
  }, [cursor, loadingMore, fetchPage])

  useEffect(() => {
    if (authLoading) return
    if (!isSuperadmin) {
      router.push('/admin')
      return
    }
    reload()
  }, [authLoading, isSuperadmin, router, reload])

  const actors = useMemo(() => {
    const map = new Map<string, string>()
    for (const e of entries) {
      const label = e.email ?? e.uid
      if (!map.has(e.uid)) map.set(e.uid, label)
    }
    return Array.from(map, ([uid, label]) => ({ uid, label }))
  }, [entries])

  const resources = useMemo(() => {
    return Array.from(new Set(entries.map((e) => e.resource))).sort()
  }, [entries])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (actorFilter !== 'all' && e.uid !== actorFilter) return false
      if (resourceFilter !== 'all' && e.resource !== resourceFilter) return false
      if (actionFilter !== 'all' && e.action !== actionFilter) return false
      return true
    })
  }, [entries, actorFilter, resourceFilter, actionFilter])

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
        You need the superadmin role to view the audit log.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit log</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every admin action over the last 30 days. Records older than that are purged
            automatically by Firestore TTL.
          </p>
        </div>
        <button
          onClick={reload}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Actor</label>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white min-w-[180px]"
          >
            <option value="all">All actors</option>
            {actors.map((a) => (
              <option key={a.uid} value={a.uid}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Resource</label>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white min-w-[160px]"
          >
            <option value="all">All resources</option>
            {resources.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white min-w-[160px]"
          >
            <option value="all">All actions</option>
            {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
              <option key={a} value={a}>
                {ACTION_LABELS[a]}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto self-end text-xs text-gray-500">
          {filtered.length} of {entries.length} entries shown
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-2 py-3"></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">When</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((e) => {
                const expandable = !!e.details && Object.keys(e.details).length > 0
                const isOpen = expanded.has(e.id)
                return (
                  <ExpandableRow
                    key={e.id}
                    entry={e}
                    expandable={expandable}
                    isOpen={isOpen}
                    onToggle={() => toggleExpanded(e.id)}
                  />
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    No entries match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {hasMore && (
            <div className="border-t border-gray-200 px-4 py-3 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                Load older entries
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ExpandableRowProps {
  entry: AuditLogEntry
  expandable: boolean
  isOpen: boolean
  onToggle: () => void
}

function ExpandableRow({ entry, expandable, isOpen, onToggle }: ExpandableRowProps) {
  return (
    <>
      <tr className={`hover:bg-gray-50 ${expandable ? 'cursor-pointer' : ''}`} onClick={expandable ? onToggle : undefined}>
        <td className="px-2 py-3 text-gray-400">
          {expandable ? (
            isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : null}
        </td>
        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap font-mono">
          {formatTimestamp(entry.timestamp)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          <div className="font-medium">{entry.email ?? entry.uid}</div>
          <div className="text-[11px] text-gray-400 capitalize">{entry.role}</div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex text-xs px-2 py-1 rounded font-medium ${ACTION_COLORS[entry.action]}`}>
            {ACTION_LABELS[entry.action]}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-700">
          <div className="font-mono">{entry.resource}</div>
          {entry.resourceId && (
            <div className="text-[11px] text-gray-400 font-mono truncate max-w-[280px]">
              {entry.resourceId}
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700">{entry.label ?? '—'}</td>
      </tr>
      {expandable && isOpen && (
        <tr className="bg-gray-50/60">
          <td></td>
          <td colSpan={5} className="px-4 pb-4 pt-1">
            <pre className="text-[11px] text-gray-600 bg-white border border-gray-200 rounded p-3 overflow-x-auto">
              {JSON.stringify(entry.details, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  )
}
