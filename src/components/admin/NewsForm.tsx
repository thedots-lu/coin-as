'use client'

import { useState } from 'react'
import { NewsItem } from '@/lib/types/news'
import { createEmptyLocaleString, LocaleString } from '@/lib/types/locale'
import LocaleEditor from './LocaleEditor'

interface NewsFormProps {
  news?: NewsItem
  onSave: (data: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function NewsForm({ news, onSave, onCancel }: NewsFormProps) {
  const [title, setTitle] = useState<LocaleString>(news?.title || createEmptyLocaleString())
  const [content, setContent] = useState<LocaleString>(news?.content || createEmptyLocaleString())
  const [excerpt, setExcerpt] = useState<LocaleString>(news?.excerpt || createEmptyLocaleString())
  const [slug, setSlug] = useState<LocaleString>(news?.slug || createEmptyLocaleString())
  const [imageUrl, setImageUrl] = useState(news?.imageUrl || '')
  const [published, setPublished] = useState(news?.published ?? false)
  const [author, setAuthor] = useState(news?.author || '')
  const [tags, setTags] = useState(news?.tags?.join(', ') || '')
  const [type, setType] = useState<'news' | 'event'>(news?.type || 'news')
  const [eventDate, setEventDate] = useState(
    news?.eventDate ? formatDateForInput(news.eventDate) : ''
  )
  const [eventLocation, setEventLocation] = useState<LocaleString>(
    news?.eventLocation || createEmptyLocaleString()
  )

  function formatDateForInput(date: unknown): string {
    if (!date) return ''
    if (date instanceof Date) return date.toISOString().split('T')[0]
    if (typeof date === 'object' && 'toDate' in (date as Record<string, unknown>)) {
      return (date as { toDate: () => Date }).toDate().toISOString().split('T')[0]
    }
    return ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      content,
      excerpt,
      slug,
      imageUrl: imageUrl || null,
      published,
      publishedAt: published ? new Date() : null,
      author,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      type,
      eventDate: eventDate ? new Date(eventDate) : null,
      eventLocation: type === 'event' ? eventLocation : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {news ? 'Edit News' : 'Create News'}
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-gray-300"
            />
            Published
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'news' | 'event')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="news">News</option>
            <option value="event">Event</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Author name"
          />
        </div>
      </div>

      <LocaleEditor label="Title" value={title} onChange={setTitle} />
      <LocaleEditor label="Slug" value={slug} onChange={setSlug} />
      <LocaleEditor label="Excerpt" value={excerpt} onChange={setExcerpt} multiline rows={3} />
      <LocaleEditor label="Content" value={content} onChange={setContent} multiline rows={10} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="cybersecurity, event, etc."
        />
      </div>

      {type === 'event' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <LocaleEditor label="Event Location" value={eventLocation} onChange={setEventLocation} />
        </>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          {news ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
