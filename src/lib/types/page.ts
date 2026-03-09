import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore'

// Section types for pages
export interface HeroSection {
  type: 'hero'
  order: number
  heading: LocaleString
  bulletPoints: LocaleString[]
  primaryButtonText: LocaleString
  primaryButtonLink: string
  secondaryButtonText: LocaleString
  secondaryButtonLink: string
  backgroundImageUrl: string | null
}

export interface ServicePillarsSection {
  type: 'service_pillars'
  order: number
  heading: LocaleString
  subtitle: LocaleString
  ctaText: LocaleString
  pillars: Array<{
    title: LocaleString
    description: LocaleString
    tagline: LocaleString
    imageUrl: string | null
    link: string
  }>
}

export interface InnovationSection {
  type: 'innovation'
  order: number
  heading: LocaleString
  body: LocaleString
  imageUrl: string | null
}

export interface FlexibleServicesSection {
  type: 'flexible_services'
  order: number
  heading: LocaleString
  body: LocaleString
  imageUrl: string | null
}

export interface MissionStatementSection {
  type: 'mission_statement'
  order: number
  heading: LocaleString
  body: LocaleString
  imageUrl: string | null
}

export interface StatsSection {
  type: 'stats'
  order: number
  stats: Array<{
    value: number
    suffix: string
    label: LocaleString
  }>
}

export interface TestimonialsRefSection {
  type: 'testimonials_ref'
  order: number
  heading: LocaleString
}

export interface CTABannerSection {
  type: 'cta_banner'
  order: number
  heading: LocaleString
  buttonText: LocaleString
  buttonLink: string
}

export interface HeroSimpleSection {
  type: 'hero_simple'
  order: number
  heading: LocaleString
  subtitle: LocaleString
  logoUrl: string | null
  backgroundImageUrl: string | null
}

export interface MissionSection {
  type: 'mission'
  order: number
  heading: LocaleString
  body: LocaleString
  diagramSteps: LocaleString[]
  imageUrl: string | null
}

export interface ValuesSection {
  type: 'values'
  order: number
  heading: LocaleString
  imageUrl: string | null
  values: Array<{
    title: LocaleString
    description: LocaleString
  }>
}

export interface TeamsSection {
  type: 'teams'
  order: number
  heading: LocaleString
  body: LocaleString
  imageUrl: string | null
}

export interface PartnersPreviewSection {
  type: 'partners_preview'
  order: number
  heading: LocaleString
  body: LocaleString
  imageUrl: string | null
  ctaLink: string
  ctaButtonText: LocaleString
}

export interface CustomersSection {
  type: 'customers'
  order: number
  heading: LocaleString
  body: LocaleString
  imageUrl: string | null
  logoUrls: string[]
}

export interface TimelineSection {
  type: 'timeline'
  order: number
  heading: LocaleString
  events: Array<{
    year: string
    title: LocaleString
    description: LocaleString
  }>
}

export interface MapOverviewSection {
  type: 'map_overview'
  order: number
  body: LocaleString
  mapImageUrl: string | null
  isoBadgeUrl: string | null
}

export interface RoomTypesSection {
  type: 'room_types'
  order: number
  imageUrl: string | null
  rooms: Array<{
    name: LocaleString
    description: LocaleString
  }>
}

export interface SiteGallerySection {
  type: 'site_gallery'
  order: number
  sites: Array<{
    name: LocaleString
    country: LocaleString
    imageUrl: string
    description: LocaleString
  }>
}

export interface ContactInfoSection {
  type: 'contact_info'
  order: number
  heading: LocaleString
  subtitle: LocaleString
  phones: Array<{
    label: LocaleString
    number: string
  }>
}

export interface ContactFormSection {
  type: 'contact_form'
  order: number
  formLabels: {
    subject: LocaleString
    company: LocaleString
    name: LocaleString
    phone: LocaleString
    email: LocaleString
    country: LocaleString
    message: LocaleString
    submit: LocaleString
  }
  subjectOptions: LocaleString[]
  countryOptions: LocaleString[]
  privacyText: LocaleString
  gdprConsentText: LocaleString
  confirmationMessage: LocaleString
}

export interface FeaturesListSection {
  type: 'features_list'
  order: number
  heading: LocaleString
  features: Array<{
    title: LocaleString
    description: LocaleString
  }>
}

export interface BenefitsSection {
  type: 'benefits'
  order: number
  heading: LocaleString
  items: Array<{
    title: LocaleString
    description: LocaleString
  }>
}

export interface ProcessPipelineSection {
  type: 'process_pipeline'
  order: number
  steps: Array<{
    title: LocaleString
    description: LocaleString
  }>
}

export interface BusinessCaseSection {
  type: 'business_case'
  order: number
  heading: LocaleString
  body: LocaleString
  imageUrl: string | null
}

export interface RichTextSection {
  type: 'rich_text'
  order: number
  heading: LocaleString
  body: LocaleString
}

export type PageSection =
  | HeroSection
  | ServicePillarsSection
  | InnovationSection
  | FlexibleServicesSection
  | MissionStatementSection
  | StatsSection
  | TestimonialsRefSection
  | CTABannerSection
  | HeroSimpleSection
  | MissionSection
  | ValuesSection
  | TeamsSection
  | PartnersPreviewSection
  | CustomersSection
  | TimelineSection
  | MapOverviewSection
  | RoomTypesSection
  | SiteGallerySection
  | ContactInfoSection
  | ContactFormSection
  | FeaturesListSection
  | BenefitsSection
  | ProcessPipelineSection
  | BusinessCaseSection
  | RichTextSection

export interface SeoMeta {
  metaTitle: LocaleString
  metaDescription: LocaleString
  ogImage: string | null
}

export interface PageDocument {
  slug: string
  title: LocaleString
  seo: SeoMeta
  sections: PageSection[]
  body?: LocaleString  // For legal pages
  updatedAt: Timestamp | Date
  createdAt: Timestamp | Date
}
