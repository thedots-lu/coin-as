'use client'

import EditableImage from '@/components/admin/cms/EditableImage'
import { useEditing } from '@/components/admin/cms/EditingContext'

interface Props {
  imageUrl: string | null | undefined
  alt?: string
}

/**
 * Full-width banner image rendered at the top of an individual service page.
 * Hidden entirely when no image is set (the page just starts at the first
 * Firestore section). In the visual editor the placeholder stays visible so
 * the admin can upload one. Path is hard-coded to `heroImageUrl` because that
 * is the ServiceDocument field this banner reads from.
 */
export default function ServiceBanner({ imageUrl, alt }: Props) {
  const isEditing = !!useEditing()
  if (!imageUrl && !isEditing) return null

  return (
    <section className="relative w-full h-48 md:h-64 lg:h-80 bg-gray-100 overflow-hidden">
      <EditableImage
        path="heroImageUrl"
        src={imageUrl ?? null}
        alt={alt ?? ''}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </section>
  )
}
