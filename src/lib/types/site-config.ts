import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore'

export interface SiteConfig {
  siteName: string
  tagline: LocaleString
  contactEmail: string
  phoneNL: string
  phoneLU: string
  linkedinUrl: string
  companyLegal: {
    name: string
    kvk: string
    address: string
  }
  footerDescription: LocaleString
  copyright: LocaleString
  updatedAt: Timestamp | Date
}
