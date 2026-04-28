'use client'

import Image from 'next/image'
import { useEffect, ReactNode } from 'react'
import { X, ArrowUp, ArrowDown, Trash2, Plus, Eye, EyeOff } from 'lucide-react'
import { useEditing } from './EditingContext'
import {
  PageSection,
  HeroSection,
  CTABannerSection,
  StatsSection,
  HeroSlide,
} from '@/lib/types/page'
import { getLocalizedField } from '@/lib/locale'
import { HERO_DEFAULT_SLIDES, makeEmptyHeroSlide } from '@/components/sections/HeroSection'

const TYPE_LABELS: Record<string, string> = {
  hero: 'Hero',
  hero_simple: 'Hero (simple)',
  service_pillars: 'Service Pillars',
  innovation: 'Innovation',
  flexible_services: 'Flexible Services',
  mission_statement: 'Mission Statement',
  stats: 'Stats',
  cta_banner: 'CTA Banner',
  testimonials_ref: 'Testimonials',
  rich_text: 'Rich Text',
  features_list: 'Features',
  benefits: 'Benefits',
  business_case: 'Business Case',
  process_pipeline: 'Process Pipeline',
  timeline: 'Timeline',
  contact_form: 'Contact Form',
  contact_info: 'Contact Info',
  values: 'Values',
  mission: 'Mission',
  teams: 'Team',
  partners_preview: 'Partners',
  customers: 'Customers',
  map_overview: 'Map Overview',
  room_types: 'Room Types',
  site_gallery: 'Site Gallery',
  featured_carousel: 'Featured Carousel',
}

interface Props {
  section: PageSection
  originalIndex: number
  basePath: string
  isFirst: boolean
  isLast: boolean
  onClose: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

export default function SectionSettingsDrawer({
  section,
  originalIndex,
  basePath,
  isFirst,
  isLast,
  onClose,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const ctx = useEditing()!
  const label = TYPE_LABELS[section.type] ?? section.type
  const visible = section.visible !== false
  const toggleVisible = () => {
    ctx.updateAt(`${basePath}.visible`, !visible)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed top-0 right-0 bottom-0 z-[60] w-full sm:w-[400px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Section · slot {originalIndex}
            </div>
            <h3 className="text-base font-semibold text-gray-900 truncate">{label}</h3>
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

        {/* Position controls */}
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
            Position & visibility
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" /> Up
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" /> Down
            </button>
            <button
              type="button"
              onClick={toggleVisible}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                visible
                  ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-100'
                  : 'text-amber-700 bg-amber-50 border-amber-300 hover:bg-amber-100'
              }`}
              title={visible ? 'Hide on site' : 'Show on site'}
            >
              {visible ? (
                <>
                  <Eye className="w-3.5 h-3.5" /> Visible
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Hidden
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <SectionFields section={section} basePath={basePath} />
        </div>
      </aside>
    </>
  )
}

function SectionFields({ section, basePath }: { section: PageSection; basePath: string }) {
  switch (section.type) {
    case 'hero':
      return <HeroFields section={section} basePath={basePath} />
    case 'cta_banner':
      return <CTABannerFields section={section} basePath={basePath} />
    case 'stats':
      return <StatsFields section={section} basePath={basePath} />
    default:
      return (
        <p className="text-sm text-gray-500">
          No structural settings for this section. Edit text and images directly on the page.
        </p>
      )
  }
}

// ---------------- Type-specific fields ----------------

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'

function UrlField({ label, path, value, hint }: { label: string; path: string; value: string; hint?: string }) {
  const ctx = useEditing()!
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        defaultValue={value || ''}
        onBlur={(e) => {
          const v = e.target.value
          if (v !== (value || '')) ctx.updateAt(path, v)
        }}
        placeholder="/path or https://..."
        className={inputClass}
      />
    </Field>
  )
}

function HeroFields({ section, basePath }: { section: HeroSection; basePath: string }) {
  const ctx = useEditing()!
  const isInitialized = Array.isArray(section.slides)

  return (
    <>
      <UrlField
        label="Primary button URL"
        path={`${basePath}.primaryButtonLink`}
        value={section.primaryButtonLink}
        hint="Where the orange CTA points (text edited inline on the page)."
      />
      <UrlField
        label="Secondary button URL"
        path={`${basePath}.secondaryButtonLink`}
        value={section.secondaryButtonLink}
        hint="Default link if a slide doesn't override it."
      />

      <div className="mt-6 pt-5 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
            Slides {isInitialized && `(${section.slides!.length})`}
          </div>
        </div>

        {!isInitialized ? (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-900">
            <p className="mb-2">
              Slides are currently hardcoded. Click below to copy the current content into the CMS
              so you can edit slides, add new ones, or hide existing ones.
            </p>
            <button
              type="button"
              onClick={() => ctx.updateAt(`${basePath}.slides`, HERO_DEFAULT_SLIDES)}
              className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Initialize slides for editing
            </button>
          </div>
        ) : (
          <HeroSlidesManager section={section} basePath={basePath} />
        )}
      </div>
    </>
  )
}

function HeroSlidesManager({ section, basePath }: { section: HeroSection; basePath: string }) {
  const ctx = useEditing()!
  const slides = section.slides ?? []
  const ctxLocale = ctx.activeLocale

  const updateSlides = (next: HeroSlide[]) => {
    ctx.updateAt(`${basePath}.slides`, next)
  }

  const addSlide = () => {
    updateSlides([...slides, makeEmptyHeroSlide()])
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
    ctx.updateAt(`${basePath}.slides.${i}.visible`, !(slides[i].visible !== false))
  }

  return (
    <>
      <p className="text-[11px] text-gray-500 mb-3">
        Edit each slide&apos;s text and image directly on the page. Use this panel to add, hide,
        reorder, or remove slides.
      </p>
      <div className="space-y-2">
        {slides.map((slide, i) => {
          const labelText = getLocalizedField(slide.label, ctxLocale)
          const titleText = getLocalizedField(slide.title, ctxLocale)
          const isHidden = slide.visible === false
          return (
            <div
              key={i}
              className={[
                'flex items-stretch gap-2 border rounded-md overflow-hidden bg-white',
                isHidden ? 'border-gray-300 opacity-60' : 'border-gray-200',
              ].join(' ')}
            >
              {/* Thumbnail */}
              <div className="relative w-14 h-14 bg-gray-100 shrink-0">
                {slide.imageUrl ? (
                  <Image
                    src={slide.imageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                    No image
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 py-1.5 min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 truncate">
                  {labelText || `Slide ${i + 1}`}
                </div>
                <div className="text-[12px] font-medium text-gray-800 truncate">
                  {titleText || <span className="italic text-gray-400">No title</span>}
                </div>
              </div>
              {/* Actions */}
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
        <Plus className="w-3.5 h-3.5" /> Add empty slide
      </button>

      <AvailablePresets slides={slides} onAdd={(preset) => updateSlides([...slides, preset])} />

      <p className="mt-3 text-[10px] text-gray-500 leading-relaxed">
        Tip: navigate the carousel arrows on the page to reach a slide, then click any text or
        the image to edit it.
      </p>
    </>
  )
}

function AvailablePresets({
  slides,
  onAdd,
}: {
  slides: HeroSlide[]
  onAdd: (preset: HeroSlide) => void
}) {
  const usedLabels = new Set(
    slides
      .map((s) => s.label?.en?.trim().toLowerCase())
      .filter((v): v is string => !!v),
  )
  const available = HERO_DEFAULT_SLIDES.filter(
    (preset) => !usedLabels.has(preset.label.en.trim().toLowerCase()),
  )

  if (available.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
      <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
        Add a preset slide
      </div>
      <div className="flex flex-wrap gap-1.5">
        {available.map((preset) => (
          <button
            key={preset.label.en}
            type="button"
            onClick={() => onAdd(preset)}
            className="text-[11px] px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md border border-gray-200 inline-flex items-center gap-1 transition-colors"
            title={preset.title.en}
          >
            <Plus className="w-3 h-3" /> {preset.label.en}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-gray-500">
        Presets are appended to the end. The NIS2 / DORA slide is added hidden by default — toggle
        the eye icon to reveal it.
      </p>
    </div>
  )
}

function CTABannerFields({ section, basePath }: { section: CTABannerSection; basePath: string }) {
  return (
    <UrlField label="Button URL" path={`${basePath}.buttonLink`} value={section.buttonLink} />
  )
}

function StatsFields({ section, basePath }: { section: StatsSection; basePath: string }) {
  const ctx = useEditing()!

  const handleAdd = () => {
    const newStat = {
      value: 0,
      suffix: '',
      label: { en: 'New stat', fr: '', nl: '' },
    }
    ctx.updateAt(`${basePath}.stats`, [...section.stats, newStat])
  }

  const handleRemove = (i: number) => {
    if (!confirm('Remove this stat?')) return
    ctx.updateAt(
      `${basePath}.stats`,
      section.stats.filter((_, idx) => idx !== i),
    )
  }

  const handleMove = (i: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? i - 1 : i + 1
    if (target < 0 || target >= section.stats.length) return
    const next = [...section.stats]
    ;[next[i], next[target]] = [next[target], next[i]]
    ctx.updateAt(`${basePath}.stats`, next)
  }

  return (
    <>
      <div className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
        Stats ({section.stats.length})
      </div>
      <p className="text-[11px] text-gray-500 mb-3">
        The label of each stat is edited inline on the page. Set the number and suffix here.
      </p>
      <div className="space-y-3">
        {section.stats.map((stat, i) => (
          <div key={i} className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                #{i + 1}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(i, 'up')}
                  disabled={i === 0}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-30 p-1"
                  aria-label="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(i, 'down')}
                  disabled={i === section.stats.length - 1}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-30 p-1"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="text-red-500 hover:text-red-700 p-1"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Value</label>
                <input
                  type="number"
                  value={stat.value}
                  onChange={(e) => ctx.updateAt(`${basePath}.stats.${i}.value`, parseInt(e.target.value, 10) || 0)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Suffix</label>
                <input
                  type="text"
                  value={stat.suffix}
                  onChange={(e) => ctx.updateAt(`${basePath}.stats.${i}.suffix`, e.target.value)}
                  placeholder="+, %, K..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add stat
      </button>
    </>
  )
}
