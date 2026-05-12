'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { deleteFile } from '@/lib/firebase/upload'
import { logAudit } from '@/lib/firebase/audit-log'
import { extractUrls } from '@/lib/utils/extract-urls'
import { ServiceDocument } from '@/lib/types/service'
import { Locale } from '@/lib/types/locale'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'
import ServiceBreadcrumb from '@/components/layout/ServiceBreadcrumb'
import ServiceBanner from '@/components/sections/ServiceBanner'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import ServicePageSettingsDrawer from '@/components/admin/cms/ServicePageSettingsDrawer'
import SeoSettingsDrawer from '@/components/admin/cms/SeoSettingsDrawer'
import { getPublishedServices } from '@/lib/firestore/services'

const EMPTY_LOCALE = { en: '', fr: '', nl: '' }

// Firestore docs can be missing optional fields the editor depends on
// (e.g. older docs predating SEO). Filling them with sane defaults at
// load time means save can blindly write them back without hitting
// Firestore's "undefined" rejection.
function normalizeServiceDoc(doc: ServiceDocument): ServiceDocument {
  return {
    ...doc,
    title: doc.title ?? EMPTY_LOCALE,
    sections: doc.sections ?? [],
    seo: {
      metaTitle: doc.seo?.metaTitle ?? EMPTY_LOCALE,
      metaDescription: doc.seo?.metaDescription ?? EMPTY_LOCALE,
      ogImage: doc.seo?.ogImage ?? null,
    },
  }
}
import {
  EditingProvider,
  setAtPath,
  SectionMoveDirection,
} from '@/components/admin/cms/EditingContext'
import EditorToolbar from '@/components/admin/cms/EditorToolbar'
import SectionSettingsDrawer from '@/components/admin/cms/SectionSettingsDrawer'
import { InternalRoutesDatalist } from '@/components/admin/cms/EditableLink'
import { computeLocaleStats } from '@/components/admin/cms/localeStats'
import { getLocalizedField } from '@/lib/locale'

export default function ServiceVisualEditor() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const isOverview = slug === 'overview'

  const [original, setOriginal] = useState<ServiceDocument | null>(null)
  const [draft, setDraft] = useState<ServiceDocument | null>(null)
  const [services, setServices] = useState<ServiceDocument[]>([])
  const [activeLocale, setActiveLocale] = useState<Locale>('en')
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false)
  const [seoOpen, setSeoOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [snap, allServices] = await Promise.all([
          getDoc(doc(db, 'services', slug)),
          // Aux data for the Overview's services_grid section. Cheap on
          // other slugs and avoids a conditional fetch path.
          getPublishedServices(),
        ])
        if (!alive) return
        if (!snap.exists()) {
          setError(`Service "${slug}" not found in Firestore`)
          return
        }
        const raw = { id: snap.id, ...snap.data() } as ServiceDocument
        const data = normalizeServiceDoc(raw)
        setOriginal(data)
        setDraft(data)
        setServices(allServices)
      } catch (err) {
        console.error('Failed to load service:', err)
        if (alive) setError('Failed to load service')
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
      JSON.stringify(original.sections) !== JSON.stringify(draft.sections) ||
      JSON.stringify(original.title) !== JSON.stringify(draft.title) ||
      JSON.stringify(original.seo) !== JSON.stringify(draft.seo) ||
      JSON.stringify(original.card) !== JSON.stringify(draft.card) ||
      (original.articleHref ?? null) !== (draft.articleHref ?? null) ||
      (original.heroImageUrl ?? null) !== (draft.heroImageUrl ?? null)
    )
  }, [original, draft])

  const localeStats = useMemo(() => {
    if (!draft) return []
    return computeLocaleStats({
      title: draft.title,
      seo: draft.seo,
      sections: draft.sections,
    })
  }, [draft])

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
      await updateDoc(doc(db, 'services', slug), {
        title: draft.title,
        sections: draft.sections,
        seo: draft.seo,
        card: draft.card ?? null,
        articleHref: draft.articleHref ?? null,
        heroImageUrl: draft.heroImageUrl ?? null,
        updatedAt: Timestamp.now(),
      })
      await logAudit({
        action: 'update',
        resource: 'services',
        resourceId: slug,
        label: getLocalizedField(draft.title, 'en') || slug,
        details: { sectionCount: draft.sections.length, source: 'visual-editor' },
      })
      try {
        await Promise.all(
          isOverview
            ? [triggerRevalidate('/services')]
            : [triggerRevalidate(`/services/${slug}`), triggerRevalidate('/services')],
        )
      } catch {
        /* best-effort */
      }
      if (original) {
        const before = extractUrls(original)
        const after = extractUrls(draft)
        const removed = [...before].filter((u) => !after.has(u))
        await Promise.all(removed.map((u) => deleteFile(u)))
      }
      setOriginal(draft)
    } catch (err) {
      console.error('Save failed:', err)
      alert('Save failed. Check console for details.')
    } finally {
      setSaving(false)
    }
  }, [draft, original, slug, isOverview])

  const handleBack = useCallback(async () => {
    if (isDirty && !confirm('You have unsaved changes. Leave anyway?')) return
    if (isDirty && original && draft) {
      const before = extractUrls(original)
      const after = extractUrls(draft)
      const added = [...after].filter((u) => !before.has(u))
      await Promise.all(added.map((u) => deleteFile(u)))
    }
    router.push('/admin/services')
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
        <p className="text-gray-500">{error || 'Service unavailable'}</p>
        <button
          onClick={() => router.push('/admin/services')}
          className="mt-4 text-sm text-primary-600 hover:text-primary-700"
        >
          Back to Services
        </button>
      </div>
    )
  }

  const selectedSection =
    selectedSectionIndex !== null ? draft.sections[selectedSectionIndex] : null
  const sortedPos =
    selectedSectionIndex !== null ? sortedIndices.indexOf(selectedSectionIndex) : -1
  const isFirst = sortedPos === 0
  const isLast = sortedPos === sortedIndices.length - 1

  const serviceTitle = getLocalizedField(draft.title, activeLocale) || slug
  const previewPath = isOverview ? '/services' : `/services/${draft.slug ?? slug}`
  const overviewQuickLinks = isOverview
    ? services
        .filter((s) => (s.slug ?? s.id) !== 'overview')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => ({
          label:
            getLocalizedField(s.card?.title, activeLocale) ||
            getLocalizedField(s.title, activeLocale),
          href: `/services/${s.slug ?? s.id}`,
        }))
    : []

  return (
    <div className="-m-6 bg-gray-100 min-h-[calc(100vh-64px)]">
      <InternalRoutesDatalist />
      <EditorToolbar
        title={isOverview ? 'Services Overview' : `Service: ${serviceTitle}`}
        activeLocale={activeLocale}
        setActiveLocale={setActiveLocale}
        localeStats={localeStats}
        isDirty={isDirty}
        saving={saving}
        onSave={handleSave}
        onBack={handleBack}
        previewHref={previewPath}
        formEditorHref={`/admin/services/${slug}`}
        onOpenPageSettings={isOverview ? undefined : () => setPageSettingsOpen(true)}
        onOpenSeoEditor={() => setSeoOpen(true)}
      />

      <EditingProvider
        activeLocale={activeLocale}
        setActiveLocale={setActiveLocale}
        onUpdate={onUpdate}
        storageBasePath={`services/${slug}`}
        selectedSectionIndex={selectedSectionIndex}
        openSectionSettings={openSectionSettings}
        closeSectionSettings={closeSectionSettings}
        moveSection={moveSection}
        deleteSection={deleteSection}
      >
        <div className="bg-white">
          {isOverview ? (
            <HubBanner title={serviceTitle || 'Our Services'} quickLinks={overviewQuickLinks} />
          ) : (
            <>
              <ServiceBreadcrumb serviceTitle={serviceTitle} />
              <ServiceBanner imageUrl={draft.heroImageUrl} alt={serviceTitle} />
            </>
          )}
          <PageSectionRenderer
            sections={draft.sections}
            locale={activeLocale}
            services={services}
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

        {pageSettingsOpen && !isOverview && (
          <ServicePageSettingsDrawer
            card={draft.card}
            articleHref={draft.articleHref}
            onClose={() => setPageSettingsOpen(false)}
          />
        )}

        {seoOpen && (
          <SeoSettingsDrawer
            seo={draft.seo}
            publicPath={previewPath}
            onClose={() => setSeoOpen(false)}
          />
        )}
      </EditingProvider>
    </div>
  )
}
