'use client'

import { useState } from 'react'
import { PageSection, TimelineSection } from '@/lib/types/page'
import { LocaleString, createEmptyLocaleString } from '@/lib/types/locale'
import LocaleEditor from './LocaleEditor'

type TimelineEvent = TimelineSection['events'][number]

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

    if (section.type === 'timeline') {
      fields.push(
        <TimelineEventsEditor
          key="events"
          events={section.events}
          onChange={(events) => updateSectionField(index, 'events', events)}
        />
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

interface TimelineEventsEditorProps {
  events: TimelineEvent[]
  onChange: (events: TimelineEvent[]) => void
}

function TimelineEventsEditor({ events, onChange }: TimelineEventsEditorProps) {
  const updateEvent = (index: number, patch: Partial<TimelineEvent>) => {
    const updated = events.map((e, i) => (i === index ? { ...e, ...patch } : e))
    onChange(updated)
  }

  const addEvent = () => {
    onChange([
      ...events,
      {
        year: String(new Date().getFullYear()),
        title: createEmptyLocaleString(),
        description: createEmptyLocaleString(),
      },
    ])
  }

  const removeEvent = (index: number) => {
    const event = events[index]
    const label = `${event.year} – ${event.title?.en || '(untitled)'}`
    if (!confirm(`Delete event "${label}"? This cannot be undone until you save or reload.`)) return
    onChange(events.filter((_, i) => i !== index))
  }

  const moveEvent = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= events.length) return
    const updated = [...events]
    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Events</label>
      {events.length === 0 && (
        <p className="text-sm text-gray-500">No events yet. Add one below.</p>
      )}
      {events.map((event, index) => (
        <div key={index} className="border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Event #{index + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveEvent(index, -1)}
                disabled={index === 0}
                className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveEvent(index, 1)}
                disabled={index === events.length - 1}
                className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeEvent(index)}
                className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="text"
              value={event.year}
              onChange={(e) => updateEvent(index, { year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            />
          </div>
          <LocaleEditor
            label="Title"
            value={event.title}
            onChange={(v) => updateEvent(index, { title: v })}
          />
          <LocaleEditor
            label="Description"
            value={event.description}
            onChange={(v) => updateEvent(index, { description: v })}
            multiline
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addEvent}
        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-md transition-colors"
      >
        + Add event
      </button>
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
