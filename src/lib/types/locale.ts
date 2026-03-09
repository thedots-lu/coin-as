export type Locale = 'en' | 'fr' | 'nl'

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
