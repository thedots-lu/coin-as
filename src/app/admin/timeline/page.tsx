'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { dbAdmin as db } from '@/lib/firebase/config'
import { triggerRevalidate } from '@/lib/firebase/revalidate'
import { logAudit } from '@/lib/firebase/audit-log'
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { Locale, LocaleString, createEmptyLocaleString, ENABLED_LOCALES, MULTILINGUAL_ADMIN } from '@/lib/types/locale'
import { TimelineSection } from '@/lib/types/page'
import RichTextEditor from '@/components/admin/RichTextEditor'

type TimelineEvent = TimelineSection['events'][number]

interface TimelineDraft {
  heading: LocaleString
  events: TimelineEvent[]
}

const LOCALES: Locale[] = ENABLED_LOCALES
// Suffix shown on field labels (e.g. " (EN)") — dropped entirely when the
// admin is single-locale, so editors see plain "Title" / "Description".
const LOCALE_SUFFIX = (locale: Locale) => (MULTILINGUAL_ADMIN ? ` (${locale.toUpperCase()})` : '')

function emptyEvent(): TimelineEvent {
  return {
    year: String(new Date().getFullYear()),
    title: createEmptyLocaleString(),
    description: createEmptyLocaleString(),
  }
}

export default function TimelineAdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeLocale, setActiveLocale] = useState<Locale>('en')
  const [original, setOriginal] = useState<TimelineDraft | null>(null)
  const [draft, setDraft] = useState<TimelineDraft | null>(null)
  const [sectionIndex, setSectionIndex] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'pages', 'about'))
        if (!alive) return
        if (!snap.exists()) {
          setError('pages/about not found in Firestore')
          return
        }
        const data = snap.data() as { sections?: Array<Record<string, unknown>> }
        const sections = data.sections ?? []
        const idx = sections.findIndex((s) => s.type === 'timeline')
        if (idx === -1) {
          setError('No timeline section in pages/about')
          return
        }
        const section = sections[idx] as unknown as TimelineSection
        const initial: TimelineDraft = {
          heading: section.heading ?? createEmptyLocaleString(),
          events: Array.isArray(section.events) ? section.events : [],
        }
        setOriginal(initial)
        setDraft(initial)
        setSectionIndex(idx)
      } catch (err) {
        console.error('Failed to load timeline:', err)
        if (alive) setError('Failed to load timeline')
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
    return JSON.stringify(original) !== JSON.stringify(draft)
  }, [original, draft])

  const updateHeading = (text: string) => {
    setDraft((prev) =>
      prev ? { ...prev, heading: { ...prev.heading, [activeLocale]: text } } : prev,
    )
  }

  const updateEvent = (index: number, patch: Partial<TimelineEvent>) => {
    setDraft((prev) => {
      if (!prev) return prev
      const next = prev.events.map((e, i) => (i === index ? { ...e, ...patch } : e))
      return { ...prev, events: next }
    })
  }

  const updateEventLocale = (
    index: number,
    field: 'title' | 'description',
    text: string,
  ) => {
    setDraft((prev) => {
      if (!prev) return prev
      const next = prev.events.map((e, i) =>
        i === index ? { ...e, [field]: { ...e[field], [activeLocale]: text } } : e,
      )
      return { ...prev, events: next }
    })
  }

  const addEvent = () => {
    setDraft((prev) => (prev ? { ...prev, events: [...prev.events, emptyEvent()] } : prev))
  }

  const removeEvent = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev
      const e = prev.events[index]
      const label = `${e.year} – ${e.title?.en || '(untitled)'}`
      if (!confirm(`Remove event "${label}"?`)) return prev
      return { ...prev, events: prev.events.filter((_, i) => i !== index) }
    })
  }

  const moveEvent = (index: number, dir: -1 | 1) => {
    setDraft((prev) => {
      if (!prev) return prev
      const target = index + dir
      if (target < 0 || target >= prev.events.length) return prev
      const next = [...prev.events]
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...prev, events: next }
    })
  }

  const handleSave = useCallback(async () => {
    if (!draft || sectionIndex === null) return
    setSaving(true)
    try {
      const ref = doc(db, 'pages', 'about')
      const snap = await getDoc(ref)
      if (!snap.exists()) throw new Error('pages/about disappeared')
      const data = snap.data() as { sections?: Array<Record<string, unknown>> }
      const sections = data.sections ?? []
      if (!sections[sectionIndex] || sections[sectionIndex].type !== 'timeline') {
        throw new Error('Timeline section moved or removed; reload and try again.')
      }
      const newSections = [...sections]
      newSections[sectionIndex] = {
        ...sections[sectionIndex],
        heading: draft.heading,
        events: draft.events,
      }
      await updateDoc(ref, { sections: newSections, updatedAt: Timestamp.now() })
      await logAudit({
        action: 'update',
        resource: 'pages',
        resourceId: 'about',
        label: 'Timeline (about page)',
        details: { eventCount: draft.events.length },
      })
      try {
        await triggerRevalidate('/about')
      } catch {
        /* best-effort */
      }
      setOriginal(draft)
    } catch (err) {
      console.error('Save failed:', err)
      alert((err as Error).message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }, [draft, sectionIndex])

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
        <p className="text-gray-500">{error || 'Timeline unavailable'}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            History events shown on the About page (<code className="text-xs">#history</code>{' '}
            section).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {MULTILINGUAL_ADMIN && (
            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-md p-1">
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setActiveLocale(loc)}
                  className={`px-3 py-1 text-xs font-semibold uppercase rounded transition-colors ${
                    activeLocale === loc
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isDirty && !saving
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {isDirty ? 'Save changes' : 'Saved'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Heading */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Section heading{LOCALE_SUFFIX(activeLocale)}
        </label>
        <input
          type="text"
          value={draft.heading[activeLocale] ?? ''}
          onChange={(e) => updateHeading(e.target.value)}
          placeholder="e.g. Our History"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>

      {/* Events */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Events ({draft.events.length})
          </h2>
          <button
            type="button"
            onClick={addEvent}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            <Plus className="w-3.5 h-3.5" /> Add event
          </button>
        </div>

        {draft.events.length === 0 ? (
          <p className="text-sm text-gray-500 px-5 py-8 text-center">
            No events yet. Click <strong>Add event</strong> to create one.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {draft.events.map((event, i) => (
              <li key={i} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-6">
                    <button
                      type="button"
                      onClick={() => moveEvent(i, -1)}
                      disabled={i === 0}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveEvent(i, 1)}
                      disabled={i === draft.events.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[100px_1fr] gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        value={event.year}
                        onChange={(e) => updateEvent(i, { year: e.target.value })}
                        placeholder="2024"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          Title{LOCALE_SUFFIX(activeLocale)}
                        </label>
                        <input
                          type="text"
                          value={event.title?.[activeLocale] ?? ''}
                          onChange={(e) => updateEventLocale(i, 'title', e.target.value)}
                          placeholder="Title"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          Description{LOCALE_SUFFIX(activeLocale)}
                        </label>
                        <RichTextEditor
                          key={`${i}-${activeLocale}`}
                          value={event.description?.[activeLocale] ?? ''}
                          onChange={(html) => updateEventLocale(i, 'description', html)}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeEvent(i)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors mt-5"
                    aria-label="Remove event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
