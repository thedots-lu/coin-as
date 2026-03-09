import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore/lite'

export interface TeamMember {
  id: string
  name: string
  position: LocaleString
  bio: LocaleString
  photoUrl: string | null
  linkedinUrl: string | null
  order: number
  published: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}
