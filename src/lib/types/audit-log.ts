import { Timestamp } from 'firebase/firestore'
import { AdminRole } from '@/lib/firebase/roles'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'reorder'
  | 'visibility_toggle'
  | 'upload'
  | 'remove_file'

/** A single audit-log row, as stored in Firestore (`audit_logs` collection). */
export interface AuditLogEntry {
  id: string
  uid: string
  email: string | null
  role: AdminRole
  action: AuditAction
  /**
   * Logical resource being acted on — usually a Firestore collection name
   * (`sites`, `news`, …) or `r2` for storage object operations.
   */
  resource: string
  /** Firestore doc id, R2 key, or any stable identifier. Optional. */
  resourceId?: string
  /** Human-readable label (page title, doc name, filename) for display. */
  label?: string
  /**
   * Free-form extra context — e.g. fields that changed, old/new visibility,
   * source/target page slug. Kept small (no full payloads) to avoid bloat.
   */
  details?: Record<string, unknown>
  timestamp: Timestamp
  /** Server-set TTL marker. Firestore TTL policy purges past this date. */
  expiresAt: Timestamp
}

/** Shape sent by the client when writing a log. The server fills in
 *  the actor (uid/email/role), timestamp and expiresAt. */
export interface AuditLogInput {
  action: AuditAction
  resource: string
  resourceId?: string
  label?: string
  details?: Record<string, unknown>
}
