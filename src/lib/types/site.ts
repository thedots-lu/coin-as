import type { Timestamp } from 'firebase/firestore'
import type { LocaleString } from './locale'

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
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
