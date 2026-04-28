/**
 * Scan a Firestore dump folder, find every Firebase Storage URL referenced in
 * the JSON, and download those files locally.
 *
 *   npm run dump-storage                       # uses the most recent dumps/ folder
 *   npm run dump-storage -- --dump my-folder   # use a specific dump folder
 *
 * Output (inside the dump folder):
 *   storage/...                       (downloaded files, mirrored from bucket paths)
 *   _storage_manifest.json            ([{ url, localPath, contentType?, references: [...] }])
 *
 * "References" track every (collection, docId, fieldPath) that points at the
 * URL — handy when restoring into a new bucket so the DB can be rewritten with
 * the new URLs.
 *
 * Storage URLs found are typically:
 *   https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded-path>?alt=media&token=...
 *   https://storage.googleapis.com/<bucket>/<path>
 *
 * Both shapes are handled.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'

interface FoundUrl {
  url: string
  references: Array<{ collection: string; docId: string; fieldPath: string }>
}

interface ManifestEntry extends FoundUrl {
  localPath: string
  contentType?: string
  size?: number
  error?: string
}

function getDumpDir(): string {
  const flagIndex = process.argv.indexOf('--dump')
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) {
    return process.argv[flagIndex + 1]
  }
  // Default: most recently created folder under dumps/
  if (!existsSync('dumps')) {
    throw new Error('No dumps/ folder. Run `npm run dump-firestore` first, or pass --dump.')
  }
  const candidates = readdirSync('dumps')
    .map((n) => ({ name: n, path: join('dumps', n) }))
    .filter((c) => statSync(c.path).isDirectory())
    .sort((a, b) => statSync(b.path).mtimeMs - statSync(a.path).mtimeMs)
  if (candidates.length === 0) {
    throw new Error('No dump folders found under dumps/.')
  }
  return candidates[0].path
}

function isStorageUrl(s: string): boolean {
  return (
    s.startsWith('https://firebasestorage.googleapis.com/') ||
    /^https:\/\/storage\.googleapis\.com\/[^/]+\//.test(s)
  )
}

// Walk a JSON value tree and call cb on every string leaf with its dotted field path.
function walkStrings(value: unknown, path: string, cb: (s: string, path: string) => void): void {
  if (typeof value === 'string') {
    cb(value, path)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkStrings(v, `${path}[${i}]`, cb))
    return
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      walkStrings(v, path ? `${path}.${k}` : k, cb)
    }
  }
}

// Decode a Firebase Storage URL to recover the original bucket-relative path.
function pathFromStorageUrl(url: string): string {
  // Form 1: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded>?alt=media...
  const m1 = url.match(/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/([^?]+)/)
  if (m1) return decodeURIComponent(m1[1])
  // Form 2: https://storage.googleapis.com/<bucket>/<path>
  const m2 = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)$/)
  if (m2) return decodeURIComponent(m2[1].split('?')[0])
  // Fallback: last path segment
  return decodeURIComponent(new URL(url).pathname.split('/').pop() || 'unknown')
}

async function downloadFile(url: string, dest: string): Promise<{ contentType?: string; size: number }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  const contentType = res.headers.get('content-type') ?? undefined
  const buffer = Buffer.from(await res.arrayBuffer())
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, buffer)
  return { contentType, size: buffer.byteLength }
}

async function main() {
  const dumpDir = getDumpDir()
  const storageDir = join(dumpDir, 'storage')
  console.log('=== Firebase Storage Dump ===')
  console.log(`Dump dir : ${dumpDir}`)
  console.log('')

  // 1. Scan every collection JSON for storage URLs
  const found = new Map<string, FoundUrl>()
  const collectionFiles = readdirSync(dumpDir).filter(
    (f) => f.endsWith('.json') && !f.startsWith('_'),
  )

  for (const file of collectionFiles) {
    const collectionName = file.replace(/\.json$/, '')
    const docs = JSON.parse(readFileSync(join(dumpDir, file), 'utf8')) as Array<Record<string, unknown>>
    for (const doc of docs) {
      const docId = String(doc.id ?? 'unknown')
      walkStrings(doc, '', (s, path) => {
        if (!isStorageUrl(s)) return
        let entry = found.get(s)
        if (!entry) {
          entry = { url: s, references: [] }
          found.set(s, entry)
        }
        entry.references.push({ collection: collectionName, docId, fieldPath: path })
      })
    }
  }

  console.log(`Found ${found.size} unique Storage URL${found.size === 1 ? '' : 's'} in dump.`)
  if (found.size === 0) {
    writeFileSync(join(dumpDir, '_storage_manifest.json'), '[]\n')
    console.log('Nothing to download.')
    process.exit(0)
  }

  // 2. Download each unique URL
  const manifest: ManifestEntry[] = []
  let i = 0
  for (const entry of found.values()) {
    i++
    const localPath = join('storage', pathFromStorageUrl(entry.url))
    const dest = join(dumpDir, localPath)
    process.stdout.write(`  [${i}/${found.size}] ${localPath.padEnd(60)} `)
    try {
      const { contentType, size } = await downloadFile(entry.url, dest)
      manifest.push({ ...entry, localPath, contentType, size })
      console.log(`${(size / 1024).toFixed(1)} KB`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      manifest.push({ ...entry, localPath, error: message })
      console.log(`FAILED: ${message}`)
    }
  }

  // 3. Write manifest
  writeFileSync(join(dumpDir, '_storage_manifest.json'), JSON.stringify(manifest, null, 2))

  const ok = manifest.filter((m) => !m.error).length
  const failed = manifest.length - ok
  const totalBytes = manifest.reduce((sum, m) => sum + (m.size ?? 0), 0)
  console.log('')
  console.log(`=== Done. ${ok} downloaded (${(totalBytes / 1024 / 1024).toFixed(2)} MB), ${failed} failed. ===`)
  console.log(`Storage at : ${storageDir}`)
  console.log(`Manifest   : ${join(dumpDir, '_storage_manifest.json')}`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Storage dump failed:', err)
  process.exit(1)
})
