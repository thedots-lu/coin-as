import { config } from 'dotenv'
config({ path: '.env.local' })
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

function loadServiceAccount() {
  const p = path.join(process.cwd(), '.firebase-target-sa.json')
  const j = JSON.parse(readFileSync(p, 'utf-8')) as {
    project_id: string
    client_email: string
    private_key: string
  }
  return { projectId: j.project_id, clientEmail: j.client_email, privateKey: j.private_key }
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(loadServiceAccount()) })
}
const db = getFirestore()

// URLs to seed. Order is preserved: first one in the array becomes order=0,
// shown first on /resources/videos.
const URLS = [
  'https://www.youtube.com/watch?v=uPMjnpNZlqg',
  'https://www.youtube.com/watch?v=YK-kvNzMUO8',
  'https://www.youtube.com/watch?v=_GYWKUgh5-c',
]

function extractId(url: string): string {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  if (!m) throw new Error(`Could not extract video id from: ${url}`)
  return m[1]
}

interface OembedResponse {
  title?: string
  thumbnail_url?: string
}

async function fetchOembed(videoId: string): Promise<{ title: string; thumbnail: string }> {
  const watch = `https://www.youtube.com/watch?v=${videoId}`
  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`,
    { cache: 'no-store' },
  )
  if (!res.ok) {
    throw new Error(`oEmbed for ${videoId} returned ${res.status}`)
  }
  const data = (await res.json()) as OembedResponse
  return {
    title: data.title ?? videoId,
    thumbnail: data.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  }
}

async function run() {
  const existingSnap = await db.collection('youtube_videos').get()
  const existingByVideoId = new Map<string, string>() // videoId → docId
  existingSnap.docs.forEach((d) => {
    const data = d.data() as { videoId?: string }
    if (data.videoId) existingByVideoId.set(data.videoId, d.id)
  })

  console.log(`Seeding ${URLS.length} curated YouTube videos…`)
  const now = Timestamp.now()

  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i]
    const videoId = extractId(url)

    if (existingByVideoId.has(videoId)) {
      console.log(`  · ${videoId}: already in DB, skipped`)
      continue
    }

    const { title, thumbnail } = await fetchOembed(videoId)
    const ref = db.collection('youtube_videos').doc()
    await ref.set({
      videoId,
      title,
      thumbnail,
      publishedAt: null,
      order: i,
      visible: true,
      createdAt: now,
      updatedAt: now,
    })
    console.log(`  ✓ ${videoId}  "${title}"`)
  }

  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
