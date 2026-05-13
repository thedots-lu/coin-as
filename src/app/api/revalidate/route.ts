import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase/admin'
import { roleFromClaims } from '@/lib/firebase/roles'

export async function POST(request: NextRequest) {
  // Extract bearer token
  const authHeader = request.headers.get('authorization') ?? ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return NextResponse.json({ error: 'Missing or malformed Authorization header' }, { status: 401 })
  }
  const token = match[1]

  // Verify Firebase ID token and require any admin role
  let decoded
  try {
    decoded = await getAdminAuth().verifyIdToken(token)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  if (!roleFromClaims(decoded)) {
    return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 })
  }

  // Parse body
  let body: { path?: string; type?: 'page' | 'layout' }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { path, type } = body
  if (!path) {
    return NextResponse.json({ error: 'Must provide "path"' }, { status: 400 })
  }
  if (type !== undefined && type !== 'page' && type !== 'layout') {
    return NextResponse.json({ error: '"type" must be "page" or "layout"' }, { status: 400 })
  }

  try {
    // Default of 'page' matches Next's own default — but most call sites
    // that change shared data (site_config, nav, services) now explicitly
    // pass 'layout' so the invalidation cascades through every page
    // underneath the marketing layout.
    if (type === 'layout') {
      revalidatePath(path, 'layout')
    } else {
      revalidatePath(path)
    }
    return NextResponse.json({ revalidated: true, path, type: type ?? 'page' })
  } catch {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
  }
}
