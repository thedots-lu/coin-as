'use client'

import { useEffect, useState, useCallback, useMemo, ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { deleteFile } from '@/lib/firebase/upload'
import { logAudit } from '@/lib/firebase/audit-log'
import { extractUrls } from '@/lib/utils/extract-urls'
import { PageDocument } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import {
  EditingProvider,
  setAtPath,
  SectionMoveDirection,
} from '@/components/admin/cms/EditingContext'
import EditorToolbar from '@/components/admin/cms/EditorToolbar'
import SectionSettingsDrawer from '@/components/admin/cms/SectionSettingsDrawer'
import SeoSettingsDrawer from '@/components/admin/cms/SeoSettingsDrawer'
import { InternalRoutesDatalist } from '@/components/admin/cms/EditableLink'
import { computeLocaleStats } from '@/components/admin/cms/localeStats'
import { getPublishedTeamMembers } from '@/lib/firestore/team'
import { getPublishedPartners } from '@/lib/firestore/partners'
import { getPublishedTestimonials } from '@/lib/firestore/testimonials'
import { getVisibleCustomerLogos } from '@/lib/firestore/customer-logos'
import { getPublishedSites } from '@/lib/firestore/sites'
import type { Testimonial } from '@/lib/types/testimonial'
import type { TeamMember } from '@/lib/types/team'
import type { Partner } from '@/lib/types/partner'
import type { Site } from '@/lib/types/site'

interface PageAuxData {
  testimonials?: Testimonial[]
  teamMembers?: TeamMember[]
  partners?: Partner[]
  customerLogos?: Array<{ url: string; name: string }>
  sites?: Site[]
}

interface PageConfig {
  title: string
  previewPath: string
  fetchAux?: () => Promise<PageAuxData>
  /** Section types to hide in the editor (mirrors any filter the public route
   *  applies — e.g. About hides hero_simple/mission). */
  hideTypes?: ReadonlyArray<string>
  /** Optional chrome rendered above the sections (e.g. HubBanner on About). */
  topChrome?: () => ReactNode
  /** When true, the public page is rendered dynamically from another
   *  collection (partners, news, etc.) so the visual editor only manages
   *  SEO. Disables the empty-sections rendering path. */
  seoOnly?: boolean
}

async function fetchHomeAux(): Promise<PageAuxData> {
  const [testimonials, customerLogos] = await Promise.all([
    getPublishedTestimonials(),
    getVisibleCustomerLogos(),
  ])
  return {
    testimonials,
    customerLogos: customerLogos.map((l) => ({ url: l.imageUrl, name: l.name })),
  }
}

async function fetchAboutAux(): Promise<PageAuxData> {
  const [teamMembers, partners, customerLogos, sites] = await Promise.all([
    getPublishedTeamMembers(),
    getPublishedPartners(),
    getVisibleCustomerLogos(),
    getPublishedSites(),
  ])
  return {
    teamMembers,
    partners,
    customerLogos: customerLogos.map((l) => ({ url: l.imageUrl, name: l.name })),
    sites,
  }
}

async function fetchLocationsAux(): Promise<PageAuxData> {
  const sites = await getPublishedSites()
  return { sites }
}

const ABOUT_QUICK_LINKS = [
  { label: 'Our Values', href: '#values' },
  { label: 'Our Experts', href: '#teams' },
  { label: 'Our Partners', href: '#partners' },
  { label: 'Our Customers', href: '#customers' },
  { label: 'Our Locations', href: '#locations' },
  { label: 'Our History', href: '#history' },
]

const PAGE_CONFIG: Record<string, PageConfig> = {
  home: { title: 'Home page', previewPath: '/', fetchAux: fetchHomeAux },
  about: {
    title: 'About page',
    previewPath: '/about',
    fetchAux: fetchAboutAux,
    hideTypes: ['hero_simple'],
    topChrome: () => <HubBanner title="About COIN" quickLinks={ABOUT_QUICK_LINKS} />,
  },
  locations: { title: 'Locations page', previewPath: '/locations', fetchAux: fetchLocationsAux },
  contact: { title: 'Contact page', previewPath: '/contact' },
  'case-studies': {
    title: 'Case Studies',
    previewPath: '/resources/case-studies',
    topChrome: () => <HubBanner title="Case Studies" backToHub />,
  },
  'legal-notice': { title: 'Legal Notice', previewPath: '/legal-notice' },
  'privacy-policy': { title: 'Privacy Policy', previewPath: '/privacy-policy' },
  'cookies-policy': { title: 'Cookies Policy', previewPath: '/cookies-policy' },
  // SEO-only pages: public route is rendered from another collection,
  // only meta is editable here.
  partners: { title: 'Partners', previewPath: '/partners', seoOnly: true },
  'become-partner': {
    title: 'Become a Partner',
    previewPath: '/partners/become-partner',
    seoOnly: true,
  },
  news: { title: 'News', previewPath: '/news', seoOnly: true },
  resources: { title: 'Resources hub', previewPath: '/resources', seoOnly: true },
  'resources-articles': {
    title: 'Articles',
    previewPath: '/resources/articles',
    seoOnly: true,
  },
  'resources-faq': { title: 'FAQ', previewPath: '/resources/faq', seoOnly: true },
  'resources-videos': {
    title: 'Videos',
    previewPath: '/resources/videos',
    seoOnly: true,
  },
  challenges: { title: 'Challenges', previewPath: '/challenges', seoOnly: true },
}

export default function PageVisualEditor() {
  const params = useParams()
  const router = useRouter()
  const pageSlug = params.pageSlug as string
  const config = PAGE_CONFIG[pageSlug]

  const [original, setOriginal] = useState<PageDocument | null>(null)
  const [draft, setDraft] = useState<PageDocument | null>(null)
  const [aux, setAux] = useState<PageAuxData>({})
  const [activeLocale, setActiveLocale] = useState<Locale>('en')
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [seoOpen, setSeoOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!config) {
      setError(`Unknown page slug: ${pageSlug}`)
      setLoading(false)
      return
    }
    let alive = true
    ;(async () => {
      try {
        const [snap, auxData] = await Promise.all([
          getDoc(doc(db, 'pages', pageSlug)),
          config.fetchAux ? config.fetchAux() : Promise.resolve({} as PageAuxData),
        ])
        if (!alive) return
        if (!snap.exists()) {
          setError(`Page "${pageSlug}" not found in Firestore`)
          return
        }
        const data = { slug: snap.id, ...snap.data() } as PageDocument
        setOriginal(data)
        setDraft(data)
        setAux(auxData)
      } catch (err) {
        console.error('Failed to load page:', err)
        if (alive) setError('Failed to load page')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [pageSlug, config])

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
    if (!draft || !config) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'pages', pageSlug), {
        title: draft.title,
        sections: draft.sections,
        seo: draft.seo,
        ...(draft.body !== undefined ? { body: draft.body } : {}),
        updatedAt: Timestamp.now(),
      })
      await logAudit({
        action: 'update',
        resource: 'pages',
        resourceId: pageSlug,
        label: config.title,
        details: { sectionCount: draft.sections.length },
      })
      try {
        await triggerRevalidate(config.previewPath)
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
  }, [draft, original, pageSlug, config])

  const handleBack = useCallback(async () => {
    if (isDirty && !confirm('You have unsaved changes. Leave anyway?')) return
    if (isDirty && original && draft) {
      const before = extractUrls(original)
      const after = extractUrls(draft)
      const added = [...after].filter((u) => !before.has(u))
      await Promise.all(added.map((u) => deleteFile(u)))
    }
    router.push('/admin/pages')
  }, [isDirty, router, original, draft])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !draft || !config) {
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

  const selectedSection =
    selectedSectionIndex !== null ? draft.sections[selectedSectionIndex] : null
  const sortedPos =
    selectedSectionIndex !== null ? sortedIndices.indexOf(selectedSectionIndex) : -1
  const isFirst = sortedPos === 0
  const isLast = sortedPos === sortedIndices.length - 1

  return (
    <div className="-m-6 bg-gray-100 min-h-[calc(100vh-64px)]">
      <InternalRoutesDatalist />
      <EditorToolbar
        title={config.title}
        activeLocale={activeLocale}
        setActiveLocale={setActiveLocale}
        localeStats={localeStats}
        isDirty={isDirty}
        saving={saving}
        onSave={handleSave}
        onBack={handleBack}
        previewHref={config.previewPath}
        formEditorHref={`/admin/pages/${pageSlug}`}
        onOpenSeoEditor={() => setSeoOpen(true)}
      />

      <EditingProvider
        activeLocale={activeLocale}
        setActiveLocale={setActiveLocale}
        onUpdate={onUpdate}
        storageBasePath={`pages/${pageSlug}`}
        selectedSectionIndex={selectedSectionIndex}
        openSectionSettings={openSectionSettings}
        closeSectionSettings={closeSectionSettings}
        moveSection={moveSection}
        deleteSection={deleteSection}
      >
        <div className="bg-white">
          {config.topChrome?.()}
          {config.seoOnly ? (
            <div className="container-padding max-w-4xl mx-auto py-16">
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-900">
                <p className="font-semibold mb-1">SEO-only page</p>
                <p>
                  The body of <code className="px-1 py-0.5 rounded bg-white">{config.previewPath}</code> is rendered
                  dynamically from another collection (partners, news, articles…) and is not editable here.
                  Use the <strong>SEO</strong> button in the toolbar to update title, description and OG image.
                </p>
              </div>
            </div>
          ) : (
            <PageSectionRenderer
              sections={draft.sections}
              locale={activeLocale}
              testimonials={aux.testimonials}
              teamMembers={aux.teamMembers}
              partners={aux.partners}
              customerLogos={aux.customerLogos}
              sites={aux.sites}
              hideTypes={config.hideTypes}
              withSectionOverlay
            />
          )}
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

        {seoOpen && (
          <SeoSettingsDrawer
            seo={draft.seo}
            publicPath={config.previewPath}
            onClose={() => setSeoOpen(false)}
          />
        )}
      </EditingProvider>
    </div>
  )
}
