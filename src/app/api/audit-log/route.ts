import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin'
import { roleFromClaims } from '@/lib/firebase/roles'
import { writeAuditLog } from '@/lib/server/audit-log'
import type { AuditAction, AuditLogInput } from '@/lib/types/audit-log'

export const runtime = 'nodejs'

const ALLOWED_ACTIONS: AuditAction[] = [
  'create',
  'update',
  'delete',
  'reorder',
  'visibility_toggle',
  'upload',
  'remove_file',
]

function isValidInput(body: unknown): body is AuditLogInput {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (typeof b.action !== 'string' || !ALLOWED_ACTIONS.includes(b.action as AuditAction)) return false
  if (typeof b.resource !== 'string' || !b.resource) return false
  if (b.resourceId !== undefined && typeof b.resourceId !== 'string') return false
  if (b.label !== undefined && typeof b.label !== 'string') return false
  if (b.details !== undefined && (typeof b.details !== 'object' || b.details === null || Array.isArray(b.details))) return false
  return true
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return NextResponse.json(
      { error: 'Missing or malformed Authorization header' },
      { status: 401 },
    )
  }

  let decoded
  try {
    decoded = await getAdminAuth().verifyIdToken(match[1])
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const role = roleFromClaims(decoded)
  if (!role) {
    return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!isValidInput(body)) {
    return NextResponse.json({ error: 'Invalid log entry' }, { status: 400 })
  }

  try {
    await writeAuditLog(getAdminDb(), {
      uid: decoded.uid,
      email: typeof decoded.email === 'string' ? decoded.email : null,
      role,
      input: body,
      now: Timestamp.now(),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/audit-log] write failed', err)
    return NextResponse.json({ error: 'Could not write log entry' }, { status: 500 })
  }
}
