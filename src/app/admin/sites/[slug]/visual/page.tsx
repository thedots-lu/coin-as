'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { collection, doc, getDocs, updateDoc, Timestamp } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { deleteFile } from '@/lib/firebase/upload'
import { logAudit } from '@/lib/firebase/audit-log'
import { extractUrls } from '@/lib/utils/extract-urls'
import { Site } from '@/lib/types/site'
import { Locale } from '@/lib/types/locale'
import { siteSlug } from '@/lib/firestore/sites'
import { getLocalizedField } from '@/lib/locale'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'
import SiteIntroCards from '@/components/sections/SiteIntroCards'
import RelatedSitesCarousel from '@/components/sections/RelatedSitesCarousel'
import {
  EditingProvider,
  setAtPath,
  SectionMoveDirection,
} from '@/components/admin/cms/EditingContext'
import EditorToolbar from '@/components/admin/cms/EditorToolbar'
import SectionSettingsDrawer from '@/components/admin/cms/SectionSettingsDrawer'
import SitePageSettingsDrawer from '@/components/admin/cms/SitePageSettingsDrawer'
import { InternalRoutesDatalist } from '@/components/admin/cms/EditableLink'

const EMPTY_LOCALE = { en: '', fr: '', nl: '' }

function normalizeSiteDoc(d: Site): Site {
  return {
    ...d,
    name: d.name ?? EMPTY_LOCALE,
    country: d.country ?? EMPTY_LOCALE,
    description: d.description ?? EMPTY_LOCALE,
    detailDescription: d.detailDescription ?? EMPTY_LOCALE,
    capacity: d.capacity ?? EMPTY_LOCALE,
    gallerySlides: d.gallerySlides ?? [],
    sections: d.sections ?? [],
  }
}

export default function SiteVisualEditor() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [original, setOriginal] = useState<Site | null>(null)
  const [draft, setDraft] = useState<Site | null>(null)
  const [allSites, setAllSites] = useState<Site[]>([])
  const [activeLocale, setActiveLocale] = useState<Locale>('en')
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load: fetch every published site once, then find the one matching the
  // URL slug. Reuses the same lookup the public route does so a missing slug
  // surfaces here too. allSites doubles as data for RelatedSitesCarousel.
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const snap = await getDocs(collection(db, 'sites'))
        if (!alive) return
        const items: Site[] = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Site,
        )
        const match = items.find((s) => siteSlug(s) === slug)
        if (!match) {
          setError(`Site "${slug}" not found in Firestore`)
          return
        }
        const data = normalizeSiteDoc(match)
        setOriginal(data)
        setDraft(data)
        setAllSites(items)
      } catch (err) {
        console.error('Failed to load site:', err)
        if (alive) setError('Failed to load site')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [slug])

  const isDirty = useMemo(() => {
    if (!original || !draft) return false
    return (
      JSON.stringify(original.description) !== JSON.stringify(draft.description) ||
      JSON.stringify(original.detailDescription) !== JSON.stringify(draft.detailDescription) ||
      JSON.stringify(original.gallerySlides) !== JSON.stringify(draft.gallerySlides) ||
      JSON.stringify(original.sections) !== JSON.stringify(draft.sections)
    )
  }, [original, draft])

  const sortedIndices = useMemo(() => {
    if (!draft) return []
    const sections = draft.sections ?? []
    return sections
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
      const sections = prev.sections ?? []
      const sortedPos = sections
        .map((s, i) => ({ s, i }))
        .sort((a, b) => a.s.order - b.s.order)
        .findIndex(({ i }) => i === originalIndex)
      const targetSortedPos = dir === 'up' ? sortedPos - 1 : sortedPos + 1
      if (sortedPos < 0 || targetSortedPos < 0 || targetSortedPos >= sections.length) {
        return prev
      }
      const sorted = sections
        .map((s, i) => ({ s, i }))
        .sort((a, b) => a.s.order - b.s.order)
      const meIdx = sorted[sortedPos].i
      const targetIdx = sorted[targetSortedPos].i
      const meOrder = sections[meIdx].order
      const targetOrder = sections[targetIdx].order
      const newSections = sections.map((s, i) => {
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
      const sections = prev.sections ?? []
      return { ...prev, sections: sections.filter((_, i) => i !== originalIndex) }
    })
    setSelectedSectionIndex(null)
  }, [])

  const openSectionSettings = useCallback((originalIndex: number) => {
    setSelectedSectionIndex(originalIndex)
  }, [])

  const closeSectionSettings = useCallback(() => {
    setSelectedSectionIndex(null)
  }, [])

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
    if (!draft || !original) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'sites', draft.id), {
        description: draft.description,
        detailDescription: draft.detailDescription ?? EMPTY_LOCALE,
        gallerySlides: draft.gallerySlides ?? [],
        sections: draft.sections ?? [],
        updatedAt: Timestamp.now(),
      })
      await logAudit({
        action: 'update',
        resource: 'sites',
        resourceId: draft.id,
        label: getLocalizedField(draft.name, 'en') || draft.id,
        details: {
          sectionCount: draft.sections?.length ?? 0,
          slideCount: draft.gallerySlides?.length ?? 0,
          source: 'visual-editor',
        },
      })
      try {
        await Promise.all([
          triggerRevalidate(`/locations/${slug}`),
          triggerRevalidate('/locations'),
        ])
      } catch {
        /* best-effort */
      }
      const before = extractUrls(original)
      const after = extractUrls(draft)
      const removed = [...before].filter((u) => !after.has(u))
      await Promise.all(removed.map((u) => deleteFile(u)))
      setOriginal(draft)
    } catch (err) {
      console.error('Save failed:', err)
      alert('Save failed. Check console for details.')
    } finally {
      setSaving(false)
    }
  }, [draft, original, slug])

  const handleBack = useCallback(async () => {
    if (isDirty && !confirm('You have unsaved changes. Leave anyway?')) return
    if (isDirty && original && draft) {
      const before = extractUrls(original)
      const after = extractUrls(draft)
      const added = [...after].filter((u) => !before.has(u))
      await Promise.all(added.map((u) => deleteFile(u)))
    }
    router.push('/admin/sites')
  }, [isDirty, router, original, draft])

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
        <p className="text-gray-500">{error || 'Site unavailable'}</p>
        <button
          onClick={() => router.push('/admin/sites')}
          className="mt-4 text-sm text-primary-600 hover:text-primary-700"
        >
          Back to Sites
        </button>
      </div>
    )
  }

  const selectedSection =
    selectedSectionIndex !== null ? (draft.sections ?? [])[selectedSectionIndex] : null
  const sortedPos =
    selectedSectionIndex !== null ? sortedIndices.indexOf(selectedSectionIndex) : -1
  const isFirst = sortedPos === 0
  const isLast = sortedPos === sortedIndices.length - 1

  const siteName = getLocalizedField(draft.name, activeLocale) || draft.id
  const otherSites = allSites.filter((s) => siteSlug(s) !== slug)

  return (
    <div className="-m-6 bg-gray-100 min-h-[calc(100vh-64px)]">
      <InternalRoutesDatalist />
      <EditorToolbar
        title={`Site page: ${siteName}`}
        activeLocale={activeLocale}
        setActiveLocale={setActiveLocale}
        localeStats={[]}
        isDirty={isDirty}
        saving={saving}
        onSave={handleSave}
        onBack={handleBack}
        previewHref={`/locations/${slug}`}
        formEditorHref={`/admin/sites`}
        onOpenPageSettings={() => setPageSettingsOpen(true)}
      />

      <EditingProvider
        activeLocale={activeLocale}
        setActiveLocale={setActiveLocale}
        onUpdate={onUpdate}
        storageBasePath={`sites/${draft.id}`}
        selectedSectionIndex={selectedSectionIndex}
        openSectionSettings={openSectionSettings}
        closeSectionSettings={closeSectionSettings}
        moveSection={moveSection}
        deleteSection={deleteSection}
      >
        <div className="bg-white">
          <SiteIntroCards site={draft} locale={activeLocale} />
          <PageSectionRenderer
            sections={draft.sections ?? []}
            locale={activeLocale}
            withSectionOverlay
          />
          <RelatedSitesCarousel sites={otherSites} locale={activeLocale} />
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

        {pageSettingsOpen && (
          <SitePageSettingsDrawer site={draft} onClose={() => setPageSettingsOpen(false)} />
        )}
      </EditingProvider>
    </div>
  )
}
