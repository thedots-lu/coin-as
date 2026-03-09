import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore/lite'

export interface Testimonial {
  id: string
  quote: LocaleString
  authorName: string
  authorTitle: LocaleString
  companyName: string
  companyLogoUrl: string | null
  order: number
  published: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}
