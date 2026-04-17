import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore/lite'

export interface ChallengeRegulation {
  text: LocaleString
}

export interface ChallengeThreat {
  title: LocaleString
  description: LocaleString
}

export interface ChallengeSolution {
  title: LocaleString
  description: LocaleString
  href: string
}

export interface ChallengeTestimonial {
  quote: LocaleString
  author: string
  role: LocaleString
  company: string
}

export interface ChallengeRelatedService {
  title: LocaleString
  href: string
}

export interface Challenge {
  id: string
  slug: string
  title: LocaleString
  subtitle: LocaleString
  heroImage: string
  intro: LocaleString
  context: LocaleString
  iconKey: string | null
  order: number
  published: boolean
  regulations: ChallengeRegulation[]
  threats: ChallengeThreat[]
  coinSolutions: ChallengeSolution[]
  testimonial: ChallengeTestimonial | null
  relatedServices: ChallengeRelatedService[]
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export type CreateChallenge = Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>
