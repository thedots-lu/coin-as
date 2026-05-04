import { auth } from './config'
import type { AuditLogInput } from '@/lib/types/audit-log'

/**
 * Best-effort fire-and-forget audit log. Never throws — a failed log must
 * not break the user-facing action. Errors are logged to the console for
 * debugging.
 *
 * Server side (POST /api/audit-log) verifies the caller's Firebase ID
 * token and fills in the actor (uid/email/role) — the body sent here is
 * trusted only for the action/resource description.
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const user = auth.currentUser
    if (!user) return
    const token = await user.getIdToken()
    const res = await fetch('/api/audit-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.warn('[logAudit] non-OK response', res.status, body)
    }
  } catch (err) {
    console.warn('[logAudit] failed', err)
  }
}
