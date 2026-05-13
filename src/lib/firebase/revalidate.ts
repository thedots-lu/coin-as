import { auth } from './config'

export type RevalidateType = 'page' | 'layout'

/**
 * Ask the server to refresh the ISR cache for a given path.
 *
 * `type` defaults to 'page', which only invalidates the leaf page segment.
 * Pass `'layout'` when the change affects a shared layout — for example,
 * site_config (header/footer) or the services collection (feeds the nav
 * menu). A 'layout' revalidate cascades through every page underneath
 * the layout, which is exactly what we want when the shared chrome changed.
 */
export async function triggerRevalidate(path: string, type: RevalidateType = 'page') {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  const token = await user.getIdToken()
  const res = await fetch('/api/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ path, type }),
  })
  if (!res.ok) throw new Error(`Revalidate failed: ${res.status}`)
  return res.json()
}
