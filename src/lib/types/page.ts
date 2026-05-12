import { LocaleString } from './locale'
import { Timestamp } from 'firebase/firestore/lite'
import type { CtaKindChoice } from '@/lib/utils/cta-labels'

// Section types for pages

export interface HeroSlide {
  imageUrl: string | null
  alt: string
  label: LocaleString
  title: LocaleString
  bullets: LocaleString[]
  description: LocaleString
  ctaText?: LocaleString
  ctaLink?: string
  visible: boolean
}

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
  // Optional — when populated, the hero carousel renders these slides from Firestore.
  // When undefined or empty, the component falls back to hardcoded defaults.
  slides?: HeroSlide[]
}

export interface ServicePillarsSection {
  type: 'service_pillars'
  order: number
  // Block 1 — lifecycle steps (Assess / Prepare / Respond ...)
  stepsHeading: LocaleString
  steps: Array<{
    name: LocaleString
    subtitle: LocaleString
    description: LocaleString
  }>
  // Block 2 — solutions catalog (links to /services/*)
  solutionsHeading: LocaleString
  solutions: Array<{
    title: LocaleString
    description: LocaleString
    href: string
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

export interface TrustedBySection {
  type: 'trusted_by'
  order: number
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
  body?: LocaleString
  theme?: 'light' | 'dark'
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
  heading?: LocaleString
  body: LocaleString
  mapImageUrl: string | null
  mapEmbedUrl?: string | null
  isoBadgeUrl: string | null
  ctaLabel?: LocaleString
}

export interface RoomTypesSection {
  type: 'room_types'
  order: number
  /** @deprecated The top image used to live here. Use an `image_carousel`
   *  section above this one for illustration. Kept optional so legacy data
   *  doesn't break the type. */
  imageUrl?: string | null
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
    address?: string
    phone?: string
    capacity?: LocaleString
    mapUrl?: string
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

export type CardsPerRow = 2 | 3 | 4

export interface FeaturesListSection {
  type: 'features_list'
  order: number
  heading: LocaleString
  // Optional override of the number of cards per row on desktop.
  // Defaults to a value derived from the card count when undefined.
  columnsPerRow?: CardsPerRow
  features: Array<{
    title: LocaleString
    description: LocaleString
    // Optional lucide icon name (e.g. "ShieldCheck"). Defaults to "Check".
    icon?: string | null
    // Up to two related article links per feature. The CTA label is derived
    // from the URL (auto) or from the matching `articleKind*` override.
    // When kind === 'custom', `articleLabel*` provides the localized text.
    articleHref1?: string
    articleHref2?: string
    articleKind1?: CtaKindChoice
    articleKind2?: CtaKindChoice
    articleLabel1?: LocaleString
    articleLabel2?: LocaleString
  }>
}

export interface LifecycleDiagramSection {
  type: 'lifecycle_diagram'
  order: number
  heading: LocaleString
  body: LocaleString
  steps: Array<{
    title: LocaleString
    tagline: LocaleString
    description: LocaleString
  }>
}

export interface ServicesGridSection {
  type: 'services_grid'
  order: number
  heading: LocaleString
}

export interface IconCardGridSection {
  type: 'icon_card_grid'
  order: number
  heading: LocaleString
  intro: LocaleString
  // Optional override of the number of cards per row on desktop.
  // Defaults to a value derived from the card count when undefined.
  columnsPerRow?: CardsPerRow
  cards: Array<{
    title: LocaleString
    body: LocaleString // HTML (TipTap output)
    icon: string
    accent?: 'primary' | 'accent' | 'red' | 'primary-dark'
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

export interface PageIntroSection {
  type: 'page_intro'
  order: number
  heading: LocaleString
  // Stored as HTML (TipTap output). Renderer sanitizes before injecting.
  body: LocaleString
}

/**
 * Generic image carousel with a single caption per slide displayed in the
 * bottom-left over a dark gradient. Used by `recovery-workplaces` but
 * reusable on any page. Slides without an imageUrl are skipped on the
 * public site; the editor shows them so they can be populated.
 */
export interface ImageCarouselSection {
  type: 'image_carousel'
  order: number
  heading?: LocaleString
  slides: Array<{
    imageUrl: string | null
    caption: LocaleString
    visible?: boolean
  }>
}

export interface FeaturedCarouselSection {
  type: 'featured_carousel'
  order: number
  heading: LocaleString
  subtitle: LocaleString
  items: Array<{
    label: LocaleString       // e.g. "Focus du mois", "Événement", "Nouveauté"
    title: LocaleString
    description: LocaleString
    imageUrl: string | null
    linkText: LocaleString
    linkHref: string
  }>
}

/**
 * Per-section visibility. When false, the section is hidden on the public site
 * but remains visible (with a "hidden" indicator) in the visual CMS editor so
 * editors can toggle it back on. Defaults to true when undefined.
 */
type WithVisibility<T> = T & { visible?: boolean }

export type PageSection = WithVisibility<
  | HeroSection
  | ServicePillarsSection
  | InnovationSection
  | FlexibleServicesSection
  | MissionStatementSection
  | TrustedBySection
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
  | FeaturedCarouselSection
  | ImageCarouselSection
  | LifecycleDiagramSection
  | ServicesGridSection
  | IconCardGridSection
  | PageIntroSection
>

export function isSectionVisible(section: { visible?: boolean }): boolean {
  return section.visible !== false
}

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
