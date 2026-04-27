'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { PageDocument } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'
import {
  EditingProvider,
  setAtPath,
  SectionMoveDirection,
} from '@/components/admin/cms/EditingContext'
import EditorToolbar from '@/components/admin/cms/EditorToolbar'
import SectionSettingsDrawer from '@/components/admin/cms/SectionSettingsDrawer'
import { computeLocaleStats } from '@/components/admin/cms/localeStats'

export default function HomeVisualEditor() {
  const router = useRouter()
  const [original, setOriginal] = useState<PageDocument | null>(null)
  const [draft, setDraft] = useState<PageDocument | null>(null)
  const [activeLocale, setActiveLocale] = useState<Locale>('en')
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'pages', 'home'))
        if (!alive) return
        if (!snap.exists()) {
          setError('Home page not found in Firestore')
          return
        }
        const data = { slug: snap.id, ...snap.data() } as PageDocument
        setOriginal(data)
        setDraft(data)
      } catch (err) {
        console.error('Failed to load home page:', err)
        if (alive) setError('Failed to load page')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const isDirty = useMemo(() => {
    if (!original || !draft) return false
    return (
      JSON.stringify(original.sections) !== JSON.stringify(draft.sections) ||
      JSON.stringify(original.title) !== JSON.stringify(draft.title) ||
      JSON.stringify(original.seo) !== JSON.stringify(draft.seo)
    )
  }, [original, draft])

  const localeStats = useMemo(() => {
    if (!draft) return []
    return computeLocaleStats({
      title: draft.title,
      seo: draft.seo,
      sections: draft.sections,
      ...(draft.body !== undefined ? { body: draft.body } : {}),
    })
  }, [draft])

  // Sorted index lookup: sortedIndices[sortedPosition] = originalIndex.
  // Used by the drawer to compute isFirst / isLast and to swap orders on move.
  const sortedIndices = useMemo(() => {
    if (!draft) return []
    return draft.sections
      .map((s, i) => ({ s, i }))
      .sort((a, b) => a.s.order - b.s.order)
      .map(({ i }) => i)
  }, [draft])

  const onUpdate = useCallback((path: string, value: unknown) => {
    setDraft((prev) => (prev ? setAtPath(prev, path, value) : prev))
  }, [])

  const moveSection = useCallback((originalIndex: number, dir: SectionMoveDirection) => {
    setDraft((prev) => {
      if (!prev) return prev
      const sortedPos = prev.sections
        .map((s, i) => ({ s, i }))
        .sort((a, b) => a.s.order - b.s.order)
        .findIndex(({ i }) => i === originalIndex)
      const targetSortedPos = dir === 'up' ? sortedPos - 1 : sortedPos + 1
      if (sortedPos < 0 || targetSortedPos < 0 || targetSortedPos >= prev.sections.length) {
        return prev
      }
      const sorted = prev.sections
        .map((s, i) => ({ s, i }))
        .sort((a, b) => a.s.order - b.s.order)
      const meIdx = sorted[sortedPos].i
      const targetIdx = sorted[targetSortedPos].i
      const meOrder = prev.sections[meIdx].order
      const targetOrder = prev.sections[targetIdx].order
      const newSections = prev.sections.map((s, i) => {
        if (i === meIdx) return { ...s, order: targetOrder }
        if (i === targetIdx) return { ...s, order: meOrder }
        return s
      })
      return { ...prev, sections: newSections }
    })
  }, [])

  const deleteSection = useCallback((originalIndex: number) => {
    setDraft((prev) => {
      if (!prev) return prev
      return { ...prev, sections: prev.sections.filter((_, i) => i !== originalIndex) }
    })
    setSelectedSectionIndex(null)
  }, [])

  const openSectionSettings = useCallback((originalIndex: number) => {
    setSelectedSectionIndex(originalIndex)
  }, [])

  const closeSectionSettings = useCallback(() => {
    setSelectedSectionIndex(null)
  }, [])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleSave = useCallback(async () => {
    if (!draft) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'pages', 'home'), {
        title: draft.title,
        sections: draft.sections,
        seo: draft.seo,
        ...(draft.body !== undefined ? { body: draft.body } : {}),
        updatedAt: Timestamp.now(),
      })
      try {
        await triggerRevalidate('/')
      } catch {
        /* best-effort */
      }
      setOriginal(draft)
    } catch (err) {
      console.error('Save failed:', err)
      alert('Save failed. Check console for details.')
    } finally {
      setSaving(false)
    }
  }, [draft])

  const handleBack = useCallback(() => {
    if (isDirty && !confirm('You have unsaved changes. Leave anyway?')) return
    router.push('/admin/pages')
  }, [isDirty, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !draft) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || 'Page unavailable'}</p>
        <button
          onClick={() => router.push('/admin/pages')}
          className="mt-4 text-sm text-primary-600 hover:text-primary-700"
        >
          Back to Pages
        </button>
      </div>
    )
  }

  // Drawer state
  const selectedSection =
    selectedSectionIndex !== null ? draft.sections[selectedSectionIndex] : null
  const sortedPos =
    selectedSectionIndex !== null ? sortedIndices.indexOf(selectedSectionIndex) : -1
  const isFirst = sortedPos === 0
  const isLast = sortedPos === sortedIndices.length - 1

  return (
    <div className="-m-6 bg-gray-100 min-h-[calc(100vh-64px)]">
      <EditorToolbar
        title="Home page"
        activeLocale={activeLocale}
        setActiveLocale={setActiveLocale}
        localeStats={localeStats}
        isDirty={isDirty}
        saving={saving}
        onSave={handleSave}
        onBack={handleBack}
        previewHref="/"
        formEditorHref="/admin/pages/home"
      />

      <EditingProvider
        activeLocale={activeLocale}
        setActiveLocale={setActiveLocale}
        onUpdate={onUpdate}
        storageBasePath="pages/home"
        selectedSectionIndex={selectedSectionIndex}
        openSectionSettings={openSectionSettings}
        closeSectionSettings={closeSectionSettings}
        moveSection={moveSection}
        deleteSection={deleteSection}
      >
        <div className="bg-white">
          <PageSectionRenderer
            sections={draft.sections}
            locale={activeLocale}
            withSectionOverlay
          />
        </div>

        {selectedSection && selectedSectionIndex !== null && (
          <SectionSettingsDrawer
            section={selectedSection}
            originalIndex={selectedSectionIndex}
            basePath={`sections.${selectedSectionIndex}`}
            isFirst={isFirst}
            isLast={isLast}
            onClose={closeSectionSettings}
            onMoveUp={() => moveSection(selectedSectionIndex, 'up')}
            onMoveDown={() => moveSection(selectedSectionIndex, 'down')}
            onDelete={() => {
              if (confirm('Delete this section? This cannot be undone (until you save).')) {
                deleteSection(selectedSectionIndex)
              }
            }}
          />
        )}
      </EditingProvider>
    </div>
  )
}
