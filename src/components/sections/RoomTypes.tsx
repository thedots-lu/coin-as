'use client'

import { RoomTypesSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import { Server } from 'lucide-react'
import EditableText from '@/components/admin/cms/EditableText'
import EditableImage from '@/components/admin/cms/EditableImage'
import RichInlineText from '@/components/admin/cms/RichInlineText'
import { useEditing } from '@/components/admin/cms/EditingContext'

interface RoomTypesProps {
  section: RoomTypesSection
  locale: Locale
  basePath: string
}

export default function RoomTypes({ section, basePath }: RoomTypesProps) {
  const isEditing = !!useEditing()
  const rooms = section.rooms ?? []

  return (
    <section className="py-20 bg-warm-100/60">
      <div className="container-padding">
        {(section.imageUrl || isEditing) && (
          <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-12 shadow-lg group">
            <EditableImage
              path={`${basePath}.imageUrl`}
              src={section.imageUrl}
              alt="Recovery room facilities"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/60 via-secondary-900/20 to-transparent pointer-events-none" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, index) => (
            <div
              key={index}
              className="glass-card p-6 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                <Server className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-1">
                  <EditableText
                    path={`${basePath}.rooms.${index}.name`}
                    value={room.name}
                    as="span"
                  />
                </h3>
                <RichInlineText
                  path={`${basePath}.rooms.${index}.description`}
                  value={room.description}
                  className="text-secondary-600 text-sm prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_ul]:!pl-4 [&_ol]:!pl-5 [&_li]:!my-0.5 [&_li]:!pl-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
