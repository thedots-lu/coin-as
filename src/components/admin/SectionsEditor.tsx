'use client'

import { useState } from 'react'
import { PageSection } from '@/lib/types/page'
import { LocaleString } from '@/lib/types/locale'
import LocaleEditor from './LocaleEditor'

interface SectionsEditorProps {
  sections: PageSection[]
  onChange: (sections: PageSection[]) => void
}

export default function SectionsEditor({ sections, onChange }: SectionsEditorProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null)

  const updateSectionField = (sectionIndex: number, field: string, value: unknown) => {
    const updated = [...sections]
    updated[sectionIndex] = { ...updated[sectionIndex], [field]: value }
    onChange(updated)
  }

  const deleteSection = (sectionIndex: number) => {
    const section = sections[sectionIndex]
    const label = `#${section.order} – ${formatSectionType(section.type)}`
    if (!confirm(`Delete section "${label}"? This cannot be undone until you save or reload.`)) return
    const updated = sections.filter((_, i) => i !== sectionIndex)
    onChange(updated)
    setExpandedSection(null)
  }

  const renderSectionFields = (section: PageSection, index: number) => {
    const fields: React.ReactNode[] = []
    const localeFields: string[] = []
    const stringFields: string[] = []

    for (const [key, value] of Object.entries(section)) {
      if (key === 'type' || key === 'order') continue
      if (value && typeof value === 'object' && 'en' in value && 'fr' in value && 'nl' in value) {
        localeFields.push(key)
      } else if (typeof value === 'string') {
        stringFields.push(key)
      }
    }

    for (const field of localeFields) {
      const val = (section as unknown as Record<string, unknown>)[field] as LocaleString
      fields.push(
        <LocaleEditor
          key={field}
          label={formatFieldName(field)}
          value={val}
          onChange={(v) => updateSectionField(index, field, v)}
          multiline={['body', 'content', 'description', 'subtitle'].includes(field)}
        />
      )
    }

    for (const field of stringFields) {
      const val = (section as unknown as Record<string, unknown>)[field] as string
      fields.push(
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{formatFieldName(field)}</label>
          <input
            type="text"
            value={val}
            onChange={(e) => updateSectionField(index, field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      )
    }

    return fields
  }

  if (sections.length === 0) {
    return (
      <div className="text-sm text-gray-500 bg-white rounded-lg border border-gray-200 p-6">
        No sections defined for this page.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === index ? null : index)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-gray-900">
                #{section.order} - {formatSectionType(section.type)}
              </span>
              <span className="ml-2 text-xs text-gray-500">({section.type})</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === index ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSection === index && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
              {renderSectionFields(section, index)}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => deleteSection(index)}
                  className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                >
                  Delete section
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function formatSectionType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/Url$/, ' URL')
}
