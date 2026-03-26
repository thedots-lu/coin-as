'use client'

import { useState, useEffect, useCallback } from 'react'
import { Locale } from '@/lib/types/locale'
import { getLocaleFromCookie, setLocaleCookie } from '@/lib/locale'

export function useLocale() {
  // Start with 'en' to match SSR, then sync from cookie after mount
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    setLocaleState(getLocaleFromCookie())
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleCookie(newLocale)
    setLocaleState(newLocale)
  }, [])

  return { locale, setLocale }
}
