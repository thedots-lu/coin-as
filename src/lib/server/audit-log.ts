import { Firestore, Timestamp } from 'firebase-admin/firestore'
import type { AdminRole } from '@/lib/firebase/roles'
import type { AuditLogInput } from '@/lib/types/audit-log'

const RETENTION_DAYS = 30
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000

interface WriteAuditLogArgs {
  uid: string
  email: string | null
  role: AdminRole
  input: AuditLogInput
  now: Timestamp
}

/**
 * Append an entry to the `audit_logs` collection. Designed to be called
 * from API routes that have already verified the Firebase ID token —
 * the caller is responsible for passing the verified `uid`/`email`/`role`
 * (the client must never be trusted to fill these).
 *
 * Failures are surfaced to the caller; the audit log is best-effort and
 * route handlers should swallow + log the error rather than failing the
 * underlying user action.
 */
export async function writeAuditLog(db: Firestore, args: WriteAuditLogArgs): Promise<void> {
  const { uid, email, role, input, now } = args
  const expiresAt = Timestamp.fromMillis(now.toMillis() + RETENTION_MS)
  const doc: Record<string, unknown> = {
    uid,
    email,
    role,
    action: input.action,
    resource: input.resource,
    timestamp: now,
    expiresAt,
  }
  if (input.resourceId) doc.resourceId = input.resourceId
  if (input.label) doc.label = input.label
  if (input.details && Object.keys(input.details).length > 0) doc.details = input.details
  await db.collection('audit_logs').add(doc)
}
