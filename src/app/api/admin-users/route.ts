import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase/admin'
import { AdminRole, isAdminRole, roleFromClaims } from '@/lib/firebase/roles'

export const runtime = 'nodejs'

interface AdminUser {
  uid: string
  email: string | null
  role: AdminRole | null
  disabled: boolean
  lastSignInAt: string | null
  createdAt: string | null
}

async function requireSuperadmin(
  request: NextRequest,
): Promise<{ ok: true; uid: string } | { ok: false; response: NextResponse }> {
  const authHeader = request.headers.get('authorization') ?? ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Missing or malformed Authorization header' },
        { status: 401 },
      ),
    }
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(match[1])
    if (roleFromClaims(decoded) !== 'superadmin') {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Forbidden — superadmin role required' },
          { status: 403 },
        ),
      }
    }
    return { ok: true, uid: decoded.uid }
  } catch (err) {
    console.error('[api/admin-users] verifyIdToken failed', err)
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
    }
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireSuperadmin(request)
  if (!auth.ok) return auth.response

  try {
    const result = await getAdminAuth().listUsers(1000)
    const users: AdminUser[] = result.users.map((u) => ({
      uid: u.uid,
      email: u.email ?? null,
      role: roleFromClaims(u.customClaims),
      disabled: u.disabled,
      lastSignInAt: u.metadata.lastSignInTime || null,
      createdAt: u.metadata.creationTime || null,
    }))
    return NextResponse.json({ users })
  } catch (err) {
    console.error('[api/admin-users] listUsers failed', err)
    return NextResponse.json({ error: 'Could not list users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request)
  if (!auth.ok) return auth.response

  let body: { uid?: string; role?: unknown }
  try {
    body = (await request.json()) as { uid?: string; role?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { uid, role } = body
  if (!uid || typeof uid !== 'string') {
    return NextResponse.json({ error: 'Missing "uid"' }, { status: 400 })
  }
  if (!isAdminRole(role)) {
    return NextResponse.json(
      { error: 'Missing or invalid "role" (must be "admin" or "superadmin")' },
      { status: 400 },
    )
  }

  // Guard rail: a superadmin cannot demote themselves — they would lose
  // access to this endpoint, leaving the app potentially without any
  // superadmin. Use the CLI script (scripts/set-admin.ts) instead.
  if (uid === auth.uid && role !== 'superadmin') {
    return NextResponse.json(
      { error: 'Cannot demote yourself. Use the CLI script if you need to.' },
      { status: 400 },
    )
  }

  try {
    const adminAuth = getAdminAuth()
    const user = await adminAuth.getUser(uid)
    const next = { ...(user.customClaims ?? {}) } as Record<string, unknown>
    next.role = role
    delete next.admin
    await adminAuth.setCustomUserClaims(uid, next)
    return NextResponse.json({ uid, role })
  } catch (err) {
    console.error('[api/admin-users] setCustomUserClaims failed', err)
    return NextResponse.json({ error: 'Could not update role' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireSuperadmin(request)
  if (!auth.ok) return auth.response

  let body: { uid?: string }
  try {
    body = (await request.json()) as { uid?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { uid } = body
  if (!uid || typeof uid !== 'string') {
    return NextResponse.json({ error: 'Missing "uid"' }, { status: 400 })
  }

  if (uid === auth.uid) {
    return NextResponse.json(
      { error: 'Cannot revoke your own role. Use the CLI script if you need to.' },
      { status: 400 },
    )
  }

  try {
    const adminAuth = getAdminAuth()
    const user = await adminAuth.getUser(uid)
    const next = { ...(user.customClaims ?? {}) } as Record<string, unknown>
    delete next.role
    delete next.admin
    await adminAuth.setCustomUserClaims(uid, next)
    return NextResponse.json({ uid, role: null })
  } catch (err) {
    console.error('[api/admin-users] revoke failed', err)
    return NextResponse.json({ error: 'Could not revoke role' }, { status: 500 })
  }
}
