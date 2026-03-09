import { LocaleString, Locale } from './types/locale'

export function getLocalizedField(field: LocaleString | null | undefined, locale: Locale = 'en'): string {
  if (!field) return ''
  const value = field[locale]
  if (value && value.trim() !== '') return value
  // Fallback to English
  if (locale !== 'en' && field.en && field.en.trim() !== '') return field.en
  return ''
}

export function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return 'en'
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/)
  const value = match ? match[1] : 'en'
  if (value === 'fr' || value === 'nl') return value
  return 'en'
}

export function setLocaleCookie(locale: Locale): void {
  document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60}`
}
