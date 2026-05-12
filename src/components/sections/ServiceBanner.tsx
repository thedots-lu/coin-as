'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import EditableImage from '@/components/admin/cms/EditableImage'
import { useEditing } from '@/components/admin/cms/EditingContext'

interface Props {
  imageUrl: string | null | undefined
  serviceTitle: string
}

/**
 * Full-width banner at the top of an individual service page.
 *
 * - Public, no image: returns null. The classic <ServiceBreadcrumb> stays.
 * - Public, with image: image + dark overlay + breadcrumb top-left + title
 *   centered. The breadcrumb is rendered inside this component (not above it)
 *   so the page header stays at one block when imagery is set.
 * - Editor, no image: bare placeholder with the Upload button. The classic
 *   <ServiceBreadcrumb> still renders above so the editor isn't disoriented.
 * - Editor, with image: same as public, image is replaceable via EditableImage.
 */
export default function ServiceBanner({ imageUrl, serviceTitle }: Props) {
  const isEditing = !!useEditing()
  if (!imageUrl && !isEditing) return null

  const hasImage = !!imageUrl

  return (
    <section className="relative w-full h-48 md:h-64 lg:h-80 bg-gray-100 overflow-hidden">
      <EditableImage
        path="heroImageUrl"
        src={imageUrl ?? null}
        alt={serviceTitle}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {hasImage && (
        <>
          {/* Dark overlay for legible text on any photo. Slightly heavier in
              the middle band where the title sits so it pops without making
              the corners look murky. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/40 pointer-events-none" />

          {/* Breadcrumb pinned top-left */}
          <nav
            aria-label="Breadcrumb"
            className="absolute top-0 inset-x-0 container-padding py-3 z-10"
          >
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link
                  href="/services"
                  className="text-white/85 hover:text-white font-medium transition-colors drop-shadow"
                >
                  Services
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-white/70" />
              </li>
              <li className="text-white font-semibold truncate drop-shadow">{serviceTitle}</li>
            </ol>
          </nav>

          {/* Title centered horizontally + vertically */}
          <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none">
            <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold font-display text-center [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]">
              {serviceTitle}
            </h1>
          </div>
        </>
      )}
    </section>
  )
}
