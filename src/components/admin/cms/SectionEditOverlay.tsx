'use client'

import { ReactNode } from 'react'
import { Settings, Eye, EyeOff } from 'lucide-react'
import { useEditing } from './EditingContext'

interface Props {
  originalIndex: number
  type: string
  visible?: boolean
  children: ReactNode
}

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
