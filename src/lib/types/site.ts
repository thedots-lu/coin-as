import type { Timestamp } from 'firebase/firestore'
import type { LocaleString } from './locale'
import type { PageSection } from './page'

/**
 * A COIN business continuity centre / location. Single source of truth used
 * both by the homepage / About-page MapOverview compact cards and by the
 * full SiteGallery on the Locations page. Stored in the `sites` collection;
 * managed through `/admin/sites`.
 */
export interface Site {
  id: string
  name: LocaleString
  country: LocaleString
  /** Free-form postal area (e.g. "Munsbach"). Optional. */
  address?: string
  /** International dial format. Empty string if no public number. */
  phone?: string
  /**
   * Building / exterior shot — used as the primary image on the compact
   * MapOverview cards (About page) and as a fallback elsewhere.
   * R2 URL — uploaded via /api/upload (`sites/<docId>/...`).
   */
  imageUrl: string
  /**
   * Interior / office shot — used by the SiteGallery on the Locations page
   * when present. Falls back to `imageUrl` when missing so the gallery
   * always renders something.
   */
  officeImageUrl?: string
  /** Long description shown on the dedicated Locations page (rich text or plain). */
  description: LocaleString
  /**
   * Description used by the top intro card of the per-site detail page
   * (/locations/<slug>) and by the cards in the "Explore our other locations"
   * carousel on every other site page. Independent from `description` so the
   * `/locations` overview grid can stay shorter while the detail page goes long.
   * Falls back to `description` when empty.
   */
  detailDescription?: LocaleString
  /** Short capacity / feature line shown on both compact and full cards. */
  capacity?: LocaleString
  /** Google Maps link (or any external map URL). Optional. */
  mapUrl?: string
  /** Optional accent colour (hex) used for the coloured bar on compact cards. */
  color?: string
  /** Sort order — lower comes first. Edited via drag-to-reorder in admin. */
  order: number
  /** Hidden from the public site when `false`. Defaults to `true`. */
  visible?: boolean
  /**
   * URL slug for the per-site detail page at /locations/<slug>. Auto-derived
   * from `name.en` when missing. Kept optional on the type for legacy docs.
   */
  slug?: string
  /**
   * Slides shown in the carousel of the per-site detail page (the right
   * 2/3 card next to the description). Same shape as ImageCarouselSection
   * slides so the public renderer is shared.
   */
  gallerySlides?: Array<{
    imageUrl: string | null
    caption?: LocaleString
    visible?: boolean
  }>
  /** Additional editable sections rendered below the intro cards block. */
  sections?: PageSection[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
