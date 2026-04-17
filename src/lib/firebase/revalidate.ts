import { auth } from './config'

export async function triggerRevalidate(path: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  const token = await user.getIdToken()
  const res = await fetch('/api/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ path }),
  })
  if (!res.ok) throw new Error(`Revalidate failed: ${res.status}`)
  return res.json()
}
