import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getAdminAuth } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

const MAX_BYTES = 25 * 1024 * 1024 // 25 MB
const ALLOWED_MIME_PREFIXES = ['image/', 'application/pdf']

let s3: S3Client | null = null
function getS3(): S3Client {
  if (s3) return s3
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)')
  }
  s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    // R2 doesn't fully support the AWS SDK v3 flexible-checksum headers
    // added in 3.730+. Limit checksums to operations that strictly need them.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
  return s3
}

function sanitizeSegment(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
}

function safeStoragePath(raw: string): string | null {
  const parts = raw
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(sanitizeSegment)
    .filter((s) => s && s !== '.' && s !== '..')
  if (parts.length === 0) return null
  return parts.join('/')
}

async function requireAdmin(
  request: NextRequest,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
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
    if (decoded.admin !== true) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Forbidden — admin claim required' }, { status: 403 }),
      }
    }
  } catch (err) {
    console.error('[api/upload] verifyIdToken failed', err)
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
    }
  }
  return { ok: true }
}

function getStorageEnv(): { bucket: string; publicUrlBase: string } | null {
  const bucket = process.env.R2_BUCKET
  const publicUrlBase = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '')
  if (!bucket || !publicUrlBase) return null
  return { bucket, publicUrlBase }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form' }, { status: 400 })
  }

  const file = form.get('file')
  const rawPath = form.get('path')
  const rawKey = form.get('key')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing "file" field' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `File too large (max ${MAX_BYTES} bytes)` }, { status: 413 })
  }
  if (!ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))) {
    return NextResponse.json({ error: `Unsupported MIME type: ${file.type}` }, { status: 415 })
  }

  // Two contracts:
  //   key  = full object key including filename (caller controls naming)
  //   path = directory; server generates `${path}/${timestamp}-${name}${ext}`
  let key: string
  if (typeof rawKey === 'string' && rawKey) {
    const safe = safeStoragePath(rawKey)
    if (!safe) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
    }
    key = safe
  } else if (typeof rawPath === 'string' && rawPath) {
    const safe = safeStoragePath(rawPath)
    if (!safe) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
    const originalName = file.name || 'upload'
    const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '')
    const baseName = sanitizeSegment(path.basename(originalName, path.extname(originalName))) || 'file'
    key = `${safe}/${Date.now()}-${baseName}${ext}`
  } else {
    return NextResponse.json({ error: 'Must provide "path" or "key"' }, { status: 400 })
  }

  const env = getStorageEnv()
  if (!env) {
    console.error('[api/upload] missing R2_BUCKET or R2_PUBLIC_URL')
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer())
    await getS3().send(
      new PutObjectCommand({
        Bucket: env.bucket,
        Key: key,
        Body: buf,
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )
  } catch (err) {
    const e = err as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } }
    console.error('[api/upload] R2 putObject failed', {
      name: e.name,
      message: e.message,
      status: e.$metadata?.httpStatusCode,
      bucket: env.bucket,
      key,
    })
    return NextResponse.json(
      { error: `Could not upload to storage: ${e.name ?? 'unknown'} — ${e.message ?? ''}` },
      { status: 502 },
    )
  }

  return NextResponse.json({ url: `${env.publicUrlBase}/${key}` })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  let body: { url?: string; key?: string }
  try {
    body = (await request.json()) as { url?: string; key?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const env = getStorageEnv()
  if (!env) {
    console.error('[api/upload] missing R2_BUCKET or R2_PUBLIC_URL')
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
  }

  // Extract object key. Either accept it directly, or derive from a public URL.
  // URLs that don't belong to our bucket are silently ignored (external/legacy).
  let key: string | null = null
  if (typeof body.key === 'string' && body.key) {
    key = safeStoragePath(body.key)
  } else if (typeof body.url === 'string' && body.url) {
    const u = body.url.trim()
    if (u.startsWith(env.publicUrlBase + '/')) {
      key = safeStoragePath(u.slice(env.publicUrlBase.length + 1))
    } else {
      // Not one of ours — nothing to delete on R2
      return NextResponse.json({ deleted: false, reason: 'external-url' })
    }
  } else {
    return NextResponse.json({ error: 'Must provide "url" or "key"' }, { status: 400 })
  }

  if (!key) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  try {
    await getS3().send(new DeleteObjectCommand({ Bucket: env.bucket, Key: key }))
  } catch (err) {
    const e = err as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } }
    console.error('[api/upload] R2 deleteObject failed', {
      name: e.name,
      message: e.message,
      status: e.$metadata?.httpStatusCode,
      bucket: env.bucket,
      key,
    })
    return NextResponse.json(
      { error: `Could not delete from storage: ${e.name ?? 'unknown'} — ${e.message ?? ''}` },
      { status: 502 },
    )
  }

  return NextResponse.json({ deleted: true, key })
}
