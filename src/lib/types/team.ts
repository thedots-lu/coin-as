import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore/lite'

export interface TeamMember {
  id: string
  name: LocaleString
  position: LocaleString
  bio: LocaleString
  photoUrl: string | null
  linkedinUrl: string | null
  order: number
  published: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

// Normalize a legacy string `name` to a LocaleString.
// Existing Firestore docs may have `name: string`; new docs use LocaleString.
export function normalizeTeamMemberName(name: unknown): LocaleString {
  if (typeof name === 'string') {
    return { en: name, fr: name, nl: name }
  }
  if (name && typeof name === 'object') {
    const n = name as Partial<LocaleString>
    return { en: n.en ?? '', fr: n.fr ?? '', nl: n.nl ?? '' }
  }
  return { en: '', fr: '', nl: '' }
}
