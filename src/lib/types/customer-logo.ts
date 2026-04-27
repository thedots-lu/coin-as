import { Timestamp } from 'firebase/firestore/lite'

export interface CustomerLogo {
  id: string
  name: string
  imageUrl: string
  order: number
  visible: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}
