import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore/lite'

export interface SiteConfig {
  siteName: string
  tagline: LocaleString
  contactEmail: string
  phoneNL: string
  phoneLU: string
  linkedinUrl: string
  newsletterUrl: string
  // When false, hide the newsletter signup (green event banner + footer link).
  // Undefined is treated as enabled to preserve behaviour for existing docs.
  newsletterEnabled?: boolean
  // Uploaded PDF of the full privacy policy. When set, the privacy-policy page
  // shows a download link beneath the (editable) intro text.
  privacyPolicyPdf?: string | null
  companyLegal: {
    name: string
    kvk: string
    address: string
  }
  footerDescription: LocaleString
  copyright: LocaleString
  updatedAt: Timestamp | Date
}
