'use client'

import { ReactNode } from 'react'
import { Settings } from 'lucide-react'
import { useEditing } from './EditingContext'

interface Props {
  originalIndex: number
  type: string
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

export default function SectionEditOverlay({ originalIndex, type, children }: Props) {
  const ctx = useEditing()
  if (!ctx?.isEditing) {
    return <>{children}</>
  }

  const isSelected = ctx.selectedSectionIndex === originalIndex
  const label = TYPE_LABELS[type] ?? type

  return (
    <div
      className={[
        'cms-section-wrap',
        isSelected ? 'cms-section-selected' : '',
      ].join(' ')}
      data-cms-section-index={originalIndex}
    >
      {children}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          ctx.openSectionSettings(originalIndex)
        }}
        className="cms-section-handle absolute top-3 right-3 z-40 inline-flex items-center gap-1.5 bg-primary-950/95 hover:bg-primary-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-md shadow-lg backdrop-blur-sm border border-white/10"
        title={`Settings · ${label}`}
      >
        <Settings className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    </div>
  )
}
