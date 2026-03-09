import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore'

export interface Partner {
  id: string
  name: string
  type: 'business' | 'technology'
  logoUrl: string
  description: LocaleString
  websiteUrl: string | null
  order: number
  published: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}
