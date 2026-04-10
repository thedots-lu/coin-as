import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore/lite'

export interface Partner {
  id: string
  name: string
  type: 'business' | 'technology'
  logoUrl: string
  description: LocaleString
  websiteUrl: string | null
  videoUrl?: string | null
  videoCaption?: LocaleString | null
  order: number
  published: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}
