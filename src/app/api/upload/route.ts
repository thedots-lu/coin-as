import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getAdminAuth } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_PREFIXES = ['image/']

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

export async function POST(request: NextRequest) {
  // Auth — Firebase ID token + admin claim
  const authHeader = request.headers.get('authorization') ?? ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return NextResponse.json({ error: 'Missing or malformed Authorization header' }, { status: 401 })
  }
  let decoded
  try {
    decoded = await getAdminAuth().verifyIdToken(match[1])
  } catch (err) {
    console.error('[api/upload] verifyIdToken failed', err)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  if (decoded.admin !== true) {
    return NextResponse.json({ error: 'Forbidden — admin claim required' }, { status: 403 })
  }

  // Parse multipart
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form' }, { status: 400 })
  }

  const file = form.get('file')
  const rawPath = form.get('path')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing "file" field' }, { status: 400 })
  }
  if (typeof rawPath !== 'string' || !rawPath) {
    return NextResponse.json({ error: 'Missing "path" field' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `File too large (max ${MAX_BYTES} bytes)` }, { status: 413 })
  }
  if (!ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))) {
    return NextResponse.json({ error: `Unsupported MIME type: ${file.type}` }, { status: 415 })
  }

  const storagePath = safeStoragePath(rawPath)
  if (!storagePath) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const originalName = file.name || 'upload'
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '')
  const baseName = sanitizeSegment(path.basename(originalName, path.extname(originalName))) || 'file'
  const key = `${storagePath}/${Date.now()}-${baseName}${ext}`

  const bucket = process.env.R2_BUCKET
  const publicUrlBase = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '')
  if (!bucket || !publicUrlBase) {
    console.error('[api/upload] missing R2_BUCKET or R2_PUBLIC_URL')
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer())
    await getS3().send(
      new PutObjectCommand({
        Bucket: bucket,
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
      bucket,
      key,
    })
    return NextResponse.json(
      { error: `Could not upload to storage: ${e.name ?? 'unknown'} — ${e.message ?? ''}` },
      { status: 502 },
    )
  }

  return NextResponse.json({ url: `${publicUrlBase}/${key}` })
}
