'use client'

import Image from 'next/image'
import { useEffect, useState, ReactNode } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { X, ArrowUp, ArrowDown, Trash2, Plus, Eye, EyeOff, Copy, Loader2 } from 'lucide-react'
import { useEditing } from './EditingContext'
import { dbAdmin } from '@/lib/firebase/config'
import { Site } from '@/lib/types/site'
import { ImageCarouselSection } from '@/lib/types/page'
import { createEmptyLocaleString } from '@/lib/types/locale'
import { getLocalizedField } from '@/lib/locale'

interface Props {
  site: Site
  onClose: () => void
}

/**
 * Page-level settings drawer for /admin/sites/<slug>/visual.
 *
 * - Shows the read-only slug (changing it would break public URLs; if needed
 *   it should be done from the form editor with a redirect plan).
 * - Manages Site.gallerySlides: add / upload / hide / reorder / remove, plus
 *   a "Copy slides from another carousel…" shortcut that pulls slides from
 *   any existing image_carousel section across pages and services.
 */
export default function SitePageSettingsDrawer({ site, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const ctx = useEditing()!
  const ctxLocale = ctx.activeLocale
  const slides = site.gallerySlides ?? []
  const [clonePickerOpen, setClonePickerOpen] = useState(false)

  const updateSlides = (next: Site['gallerySlides']) => {
    ctx.updateAt('gallerySlides', next)
  }

  const addSlide = () => {
    updateSlides([...slides, { imageUrl: null, caption: createEmptyLocaleString() }])
  }

  const removeSlide = (i: number) => {
    if (!confirm('Remove this slide?')) return
    updateSlides(slides.filter((_, idx) => idx !== i))
  }

  const moveSlide = (i: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? i - 1 : i + 1
    if (target < 0 || target >= slides.length) return
    const next = [...slides]
    ;[next[i], next[target]] = [next[target], next[i]]
    updateSlides(next)
  }

  const toggleVisible = (i: number) => {
    ctx.updateAt(`gallerySlides.${i}.visible`, !(slides[i].visible !== false))
  }

  const handleCloneApply = (
    sourceSlides: ImageCarouselSection['slides'],
    mode: 'replace' | 'append',
  ) => {
    const copy = sourceSlides.map((s) => ({
      imageUrl: s.imageUrl ?? null,
      caption: s.caption ?? createEmptyLocaleString(),
      ...(s.visible === false ? { visible: false } : {}),
    }))
    updateSlides(mode === 'replace' ? copy : [...slides, ...copy])
    setClonePickerOpen(false)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed top-0 right-0 bottom-0 z-[60] w-full sm:w-[400px] bg-white shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Site page
            </div>
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {getLocalizedField(site.name, 'en') || site.id}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Field label="URL slug" hint="Used in the public URL /locations/<slug>. Edit from the form editor to keep redirects in mind.">
            <input
              type="text"
              value={site.slug ?? ''}
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700"
            />
          </Field>

          <div className="mt-6 pt-5 border-t border-gray-200">
            <div className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Gallery slides ({slides.length})
            </div>
            <p className="text-[11px] text-gray-500 mb-3">
              Upload the image and edit the caption directly on the page. Use this panel to add,
              hide, reorder, or remove slides.
            </p>
            {slides.length === 0 && (
              <div className="rounded-md bg-gray-50 border border-dashed border-gray-300 p-4 text-[12px] text-gray-600 mb-3">
                No slides yet. Click <strong>Add slide</strong> to create the first one.
              </div>
            )}
            <div className="space-y-2">
              {slides.map((slide, i) => {
                const captionText = getLocalizedField(slide.caption, ctxLocale)
                const isHidden = slide.visible === false
                return (
                  <div
                    key={i}
                    className={[
                      'flex items-stretch gap-2 border rounded-md overflow-hidden bg-white',
                      isHidden ? 'border-gray-300 opacity-60' : 'border-gray-200',
                    ].join(' ')}
                  >
                    <div className="relative w-14 h-14 bg-gray-100 shrink-0">
                      {slide.imageUrl ? (
                        <Image src={slide.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 py-1.5 min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Slide {i + 1}
                      </div>
                      <div className="text-[12px] font-medium text-gray-800 truncate">
                        {captionText || <span className="italic text-gray-400">No caption</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 pr-1.5">
                      <button
                        type="button"
                        onClick={() => toggleVisible(i)}
                        className="text-gray-400 hover:text-gray-700 p-1"
                        aria-label={isHidden ? 'Show slide' : 'Hide slide'}
                        title={isHidden ? 'Show slide' : 'Hide slide'}
                      >
                        {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSlide(i, 'up')}
                        disabled={i === 0}
                        className="text-gray-400 hover:text-gray-700 disabled:opacity-30 p-1"
                        aria-label="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSlide(i, 'down')}
                        disabled={i === slides.length - 1}
                        className="text-gray-400 hover:text-gray-700 disabled:opacity-30 p-1"
                        aria-label="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlide(i)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Remove slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={addSlide}
              className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add slide
            </button>
            <button
              type="button"
              onClick={() => setClonePickerOpen(true)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-secondary-700 bg-white border border-secondary-200 rounded-md hover:bg-secondary-50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Copy slides from another carousel…
            </button>
          </div>
        </div>
      </aside>

      {clonePickerOpen && (
        <SiteCarouselClonePicker
          currentHasSlides={slides.length > 0}
          onClose={() => setClonePickerOpen(false)}
          onApply={handleCloneApply}
        />
      )}
    </>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

interface CarouselSource {
  collection: 'pages' | 'services'
  docId: string
  docTitle: string
  sectionIndex: number
  sectionOrder: number
  slides: ImageCarouselSection['slides']
}

/**
 * Same UX as the section-level CarouselClonePicker, but standalone so the
 * site visual editor can reuse it without going through SectionSettingsDrawer.
 * Lists every image_carousel section across pages + services.
 */
function SiteCarouselClonePicker({
  currentHasSlides,
  onClose,
  onApply,
}: {
  currentHasSlides: boolean
  onClose: () => void
  onApply: (slides: ImageCarouselSection['slides'], mode: 'replace' | 'append') => void
}) {
  const [loading, setLoading] = useState(true)
  const [sources, setSources] = useState<CarouselSource[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CarouselSource | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [pagesSnap, servicesSnap] = await Promise.all([
          getDocs(collection(dbAdmin, 'pages')),
          getDocs(collection(dbAdmin, 'services')),
        ])
        if (!alive) return
        const list: CarouselSource[] = []
        const harvest = (coll: 'pages' | 'services', snap: typeof pagesSnap) => {
          snap.forEach((d) => {
            const data = d.data() as Record<string, unknown>
            const sections = Array.isArray(data.sections) ? data.sections : []
            const title = data.title as { en?: string } | undefined
            const docTitle = title?.en || (d.id as string)
            sections.forEach((s: Record<string, unknown>, idx: number) => {
              if (s?.type !== 'image_carousel') return
              const slides = Array.isArray(s.slides)
                ? (s.slides as ImageCarouselSection['slides'])
                : []
              if (slides.length === 0) return
              list.push({
                collection: coll,
                docId: d.id,
                docTitle,
                sectionIndex: idx,
                sectionOrder: Number(s.order ?? 0),
                slides,
              })
            })
          })
        }
        harvest('pages', pagesSnap)
        harvest('services', servicesSnap)
        list.sort((a, b) => {
          if (a.collection !== b.collection) return a.collection.localeCompare(b.collection)
          if (a.docTitle !== b.docTitle) return a.docTitle.localeCompare(b.docTitle)
          return a.sectionOrder - b.sectionOrder
        })
        setSources(list)
      } catch (err) {
        console.error('Failed to load carousels for clone picker:', err)
        if (alive) setError('Failed to load carousels. Check the console.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const apply = (mode: 'replace' | 'append') => {
    if (!selected) return
    onApply(selected.slides, mode)
  }

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/50" onClick={onClose} aria-hidden />
      <div
        className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col pointer-events-auto">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Copy slides</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Pick a carousel — its slides will be added to this site.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="px-5 py-8 flex items-center justify-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading carousels…</span>
              </div>
            )}
            {error && <div className="px-5 py-6 text-sm text-red-600">{error}</div>}
            {!loading && !error && sources.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                No carousels found in pages or services.
              </div>
            )}
            {!loading && !error && sources.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {sources.map((source) => {
                  const isSelected =
                    selected?.collection === source.collection &&
                    selected.docId === source.docId &&
                    selected.sectionIndex === source.sectionIndex
                  const firstWithImage = source.slides.find((s) => s.imageUrl)
                  return (
                    <li key={`${source.collection}-${source.docId}-${source.sectionIndex}`}>
                      <button
                        type="button"
                        onClick={() => setSelected(source)}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                          isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="relative w-12 h-12 bg-gray-100 rounded shrink-0 overflow-hidden">
                          {firstWithImage?.imageUrl ? (
                            <Image
                              src={firstWithImage.imageUrl}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[9px] text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            {source.collection === 'services' ? 'Service' : 'Page'}
                          </div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {source.docTitle}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {source.slides.length} slide{source.slides.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {selected && (
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2 flex-shrink-0">
              {currentHasSlides && (
                <button
                  type="button"
                  onClick={() => apply('append')}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Append ({selected.slides.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (currentHasSlides && !confirm('Replace all current slides?')) return
                  apply('replace')
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
              >
                {currentHasSlides ? 'Replace all' : `Copy ${selected.slides.length} slides`}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Avoid an unused type warning on builds that ban it
export type _SiteDrawerProps = Props
