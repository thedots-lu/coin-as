import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore/lite'

export interface FaqItem {
  id: string
  question: LocaleString
  answer: LocaleString
  category: string
  order: number
  published: boolean
  createdAt: Timestamp | Date | string
  updatedAt: Timestamp | Date | string
}

export type CreateFaqItem = Omit<FaqItem, 'id' | 'createdAt' | 'updatedAt'>
