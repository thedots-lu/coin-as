import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  // Extract bearer token
  const authHeader = request.headers.get('authorization') ?? ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return NextResponse.json({ error: 'Missing or malformed Authorization header' }, { status: 401 })
  }
  const token = match[1]

  // Verify Firebase ID token and require admin custom claim
  let decoded
  try {
    decoded = await getAdminAuth().verifyIdToken(token)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  if (decoded.admin !== true) {
    return NextResponse.json({ error: 'Forbidden — admin claim required' }, { status: 403 })
  }

  // Parse body
  let body: { path?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { path } = body
  if (!path) {
    return NextResponse.json({ error: 'Must provide "path"' }, { status: 400 })
  }

  try {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, path })
  } catch {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
  }
}
