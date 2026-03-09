import { Timestamp } from 'firebase/firestore'

/**
 * Recursively converts Firestore Timestamps to ISO strings
 * so data can be passed from Server Components to Client Components.
 */
export function serializeFirestoreData<T>(data: unknown): T {
  if (data === null || data === undefined) return data as T
  if (data instanceof Timestamp) return data.toDate().toISOString() as unknown as T
  if (typeof data === 'object' && data !== null && 'seconds' in data && 'nanoseconds' in data) {
    // Handle Timestamp-like objects
    try {
      return new Date((data as { seconds: number }).seconds * 1000).toISOString() as unknown as T
    } catch {
      return data as T
    }
  }
  if (Array.isArray(data)) return data.map(item => serializeFirestoreData(item)) as unknown as T
  if (typeof data === 'object' && data !== null) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeFirestoreData(value)
    }
    return result as T
  }
  return data as T
}
