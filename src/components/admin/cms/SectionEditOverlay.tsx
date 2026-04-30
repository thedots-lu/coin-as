'use client'

import { ReactNode } from 'react'
import { Settings, Eye, EyeOff, Lock } from 'lucide-react'
import { useEditing } from './EditingContext'

interface Props {
  originalIndex: number
  type: string
  visible?: boolean
  children: ReactNode
}

/**
 * Section types whose components support inline editing
 * (EditableText / EditableImage / EditableLink). Any type not in this set
 * still renders normally on the public site, but the visual editor flags it
 * as read-only — visibility/move/delete remain available via the section
 * settings drawer.
 */
const INLINE_EDITABLE_TYPES: ReadonlySet<string> = new Set([
  'hero',
  'service_pillars',
  'mission_statement',
  'innovation',
  'flexible_services',
  'cta_banner',
  'stats',
  'customers',
  'mission',
  'values',
  'teams',
  'partners_preview',
  'map_overview',
  'timeline',
])

const TYPE_LABELS: Record<string, string> = {
  hero: 'Hero',
  hero_simple: 'Hero (simple)',
  service_pillars: 'Service Pillars',
  innovation: 'Innovation',
  flexible_services: 'Flexible Services',
  mission_statement: 'Mission Statement',
  trusted_by: 'Trusted By',
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

export default function SectionEditOverlay({
  originalIndex,
  type,
  visible = true,
  children,
}: Props) {
  const ctx = useEditing()
  if (!ctx?.isEditing) {
    return <>{children}</>
  }

  const isSelected = ctx.selectedSectionIndex === originalIndex
  const label = TYPE_LABELS[type] ?? type
  const isInlineEditable = INLINE_EDITABLE_TYPES.has(type)

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation()
    ctx.updateAt(`sections.${originalIndex}.visible`, !visible)
  }

  return (
    <div
      className={[
        'cms-section-wrap relative',
        isSelected ? 'cms-section-selected' : '',
        visible ? '' : 'cms-section-hidden opacity-50',
      ].join(' ')}
      data-cms-section-index={originalIndex}
    >
      {children}
      {!visible && (
        <div className="absolute top-3 left-3 z-40 inline-flex items-center gap-1.5 bg-amber-500/95 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-md shadow-lg">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Hidden on site</span>
        </div>
      )}
      {!isInlineEditable && (
        <div
          className="absolute top-3 left-3 z-40 inline-flex items-center gap-1.5 bg-slate-700/95 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-md shadow-lg"
          style={!visible ? { top: '2.75rem' } : undefined}
          title="Inline editing not yet wired for this section type — use the form editor."
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Edit via form editor</span>
        </div>
      )}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleVisibility}
          className="inline-flex items-center justify-center bg-primary-950/95 hover:bg-primary-900 text-white p-1.5 rounded-md shadow-lg backdrop-blur-sm border border-white/10"
          title={visible ? 'Hide on site' : 'Show on site'}
        >
          {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            ctx.openSectionSettings(originalIndex)
          }}
          className="cms-section-handle inline-flex items-center gap-1.5 bg-primary-950/95 hover:bg-primary-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-md shadow-lg backdrop-blur-sm border border-white/10"
          title={`Settings · ${label}`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      </div>
    </div>
  )
}
