import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase/admin'
import { roleFromClaims } from '@/lib/firebase/roles'
import { extractYoutubeId } from '@/lib/utils/youtube-id'

export const runtime = 'nodejs'

interface OembedResponse {
  title: string
  author_name?: string
  thumbnail_url?: string
}

async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization') ?? ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return NextResponse.json(
      { error: 'Missing or malformed Authorization header' },
      { status: 401 },
    )
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(match[1])
    if (!roleFromClaims(decoded)) {
      return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 })
    }
    return null
  } catch (err) {
    console.error('[api/youtube-oembed] verifyIdToken failed', err)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Missing "url" query parameter' }, { status: 400 })
  }

  const videoId = extractYoutubeId(url)
  if (!videoId) {
    return NextResponse.json({ error: 'Could not extract a YouTube video id from the URL' }, { status: 400 })
  }

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
      { cache: 'no-store' },
    )
    if (!res.ok) {
      return NextResponse.json(
        { error: `YouTube oEmbed returned ${res.status}` },
        { status: 502 },
      )
    }
    const data = (await res.json()) as OembedResponse
    return NextResponse.json({
      videoId,
      title: data.title ?? '',
      authorName: data.author_name ?? '',
      // Fall back to the canonical hqdefault thumbnail if oEmbed omits one.
      thumbnail:
        data.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      watchUrl,
    })
  } catch (err) {
    console.error('[api/youtube-oembed] fetch failed', err)
    return NextResponse.json({ error: 'Could not reach YouTube' }, { status: 502 })
  }
}
