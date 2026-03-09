'use client'

import { useState } from 'react'
import { LocaleString, Locale } from '@/lib/types/locale'

interface LocaleEditorProps {
  value: LocaleString
  onChange: (value: LocaleString) => void
  label: string
  multiline?: boolean
  rows?: number
}

const locales: { key: Locale; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'fr', label: 'FR' },
  { key: 'nl', label: 'NL' },
]

export default function LocaleEditor({ value, onChange, label, multiline = false, rows = 4 }: LocaleEditorProps) {
  const [activeTab, setActiveTab] = useState<Locale>('en')

  const handleChange = (locale: Locale, text: string) => {
    onChange({ ...value, [locale]: text })
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <div className="flex border-b border-gray-300 bg-gray-50">
          {locales.map((locale) => (
            <button
              key={locale.key}
              type="button"
              onClick={() => setActiveTab(locale.key)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                activeTab === locale.key
                  ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {locale.label}
              {value[locale.key] ? '' : ' *'}
            </button>
          ))}
        </div>
        <div className="p-1">
          {multiline ? (
            <textarea
              value={value[activeTab] || ''}
              onChange={(e) => handleChange(activeTab, e.target.value)}
              rows={rows}
              className="w-full px-3 py-2 text-sm border-0 focus:ring-0 focus:outline-none resize-y"
              placeholder={`${label} (${activeTab.toUpperCase()})`}
            />
          ) : (
            <input
              type="text"
              value={value[activeTab] || ''}
              onChange={(e) => handleChange(activeTab, e.target.value)}
              className="w-full px-3 py-2 text-sm border-0 focus:ring-0 focus:outline-none"
              placeholder={`${label} (${activeTab.toUpperCase()})`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
