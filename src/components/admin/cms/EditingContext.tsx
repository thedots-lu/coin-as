'use client'

import { createContext, useContext, ReactNode } from 'react'
import { Locale } from '@/lib/types/locale'

export type SectionMoveDirection = 'up' | 'down'

export interface EditingContextValue {
  isEditing: true
  activeLocale: Locale
  setActiveLocale: (l: Locale) => void
  updateAt: (path: string, value: unknown) => void
  storageBasePath: string
  // Section-level operations (drawer)
  selectedSectionIndex: number | null
  openSectionSettings: (originalIndex: number) => void
  closeSectionSettings: () => void
  moveSection: (originalIndex: number, direction: SectionMoveDirection) => void
  deleteSection: (originalIndex: number) => void
}

const Ctx = createContext<EditingContextValue | null>(null)

export function useEditing(): EditingContextValue | null {
  return useContext(Ctx)
}

interface ProviderProps {
  children: ReactNode
  activeLocale: Locale
  setActiveLocale: (l: Locale) => void
  onUpdate: (path: string, value: unknown) => void
  storageBasePath: string
  selectedSectionIndex: number | null
  openSectionSettings: (originalIndex: number) => void
  closeSectionSettings: () => void
  moveSection: (originalIndex: number, direction: SectionMoveDirection) => void
  deleteSection: (originalIndex: number) => void
}

export function EditingProvider({
  children,
  activeLocale,
  setActiveLocale,
  onUpdate,
  storageBasePath,
  selectedSectionIndex,
  openSectionSettings,
  closeSectionSettings,
  moveSection,
  deleteSection,
}: ProviderProps) {
  return (
    <Ctx.Provider
      value={{
        isEditing: true,
        activeLocale,
        setActiveLocale,
        updateAt: onUpdate,
        storageBasePath,
        selectedSectionIndex,
        openSectionSettings,
        closeSectionSettings,
        moveSection,
        deleteSection,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

// Immutably set a value at a dotted path inside an object.
// Numeric segments address array indices: "sections.0.pillars.2.title"
export function setAtPath<T>(root: T, path: string, value: unknown): T {
  const keys = path.split('.')

  function helper(target: unknown, idx: number): unknown {
    if (idx === keys.length) return value
    const key = keys[idx]
    const isIndex = /^\d+$/.test(key)
    if (isIndex) {
      const i = parseInt(key, 10)
      const arr = Array.isArray(target) ? [...target] : []
      arr[i] = helper(arr[i], idx + 1)
      return arr
    }
    const obj = (target && typeof target === 'object' ? { ...(target as Record<string, unknown>) } : {}) as Record<string, unknown>
    obj[key] = helper(obj[key], idx + 1)
    return obj
  }

  return helper(root, 0) as T
}

export function getAtPath(root: unknown, path: string): unknown {
  const keys = path.split('.')
  let cur: unknown = root
  for (const k of keys) {
    if (cur == null) return undefined
    if (/^\d+$/.test(k)) {
      cur = Array.isArray(cur) ? cur[parseInt(k, 10)] : undefined
    } else {
      cur = (cur as Record<string, unknown>)[k]
    }
  }
  return cur
}
