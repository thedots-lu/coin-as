export type Locale = 'en' | 'fr' | 'nl'

/**
 * Locales exposed in the admin editing UI. The public site is English-only for
 * now (the trilingual plan was dropped), so FR/NL are hidden from the editors.
 * The stored shape stays { en, fr, nl } — to re-enable a language, add it here;
 * no data migration is needed.
 */
export const ENABLED_LOCALES: Locale[] = ['en']

/** True when more than one locale is exposed in the admin (shows the language switchers). */
export const MULTILINGUAL_ADMIN = ENABLED_LOCALES.length > 1

export type LocaleString = {
  en: string
  fr: string
  nl: string
}

export function ls(text: string): LocaleString {
  return { en: text, fr: '', nl: '' }
}

export function lsAll(en: string, fr: string = '', nl: string = ''): LocaleString {
  return { en, fr, nl }
}

export function createEmptyLocaleString(): LocaleString {
  return { en: '', fr: '', nl: '' }
}
