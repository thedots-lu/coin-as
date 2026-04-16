'use client'

import { LocaleString } from '@/lib/types/locale'

interface LocaleEditorProps {
  value: LocaleString
  onChange: (value: LocaleString) => void
  label: string
  multiline?: boolean
  rows?: number
}

export default function LocaleEditor({ value, onChange, label, multiline = false, rows = 4 }: LocaleEditorProps) {
  const handleChange = (text: string) => {
    onChange({
      en: text,
      fr: value.fr ?? '',
      nl: value.nl ?? '',
    })
  }

  const inputClasses = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all'

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value?.en ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          rows={rows}
          className={`${inputClasses} resize-y`}
          placeholder={label}
        />
      ) : (
        <input
          type="text"
          value={value?.en ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className={inputClasses}
          placeholder={label}
        />
      )}
    </div>
  )
}
