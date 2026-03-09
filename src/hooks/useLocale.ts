'use client'

import { useState, useCallback } from 'react'
import { Locale } from '@/lib/types/locale'
import { getLocaleFromCookie, setLocaleCookie } from '@/lib/locale'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => getLocaleFromCookie())

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleCookie(newLocale)
    setLocaleState(newLocale)
  }, [])

  return { locale, setLocale }
}
