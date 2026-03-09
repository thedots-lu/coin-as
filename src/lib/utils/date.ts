import { Timestamp } from 'firebase/firestore'

export function formatDate(date: Timestamp | Date | string | null | undefined): string {
  if (!date) return ''
  let d: Date
  if (date instanceof Timestamp) {
    d = date.toDate()
  } else if (typeof date === 'string') {
    d = new Date(date)
  } else {
    d = date
  }
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
