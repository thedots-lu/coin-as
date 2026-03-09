import { getLocalizedField } from '@/lib/locale'
import { RoomTypesSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import { Server } from 'lucide-react'
import Image from 'next/image'

interface RoomTypesProps {
  section: RoomTypesSection
  locale: Locale
}

export default function RoomTypes({ section, locale }: RoomTypesProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container-padding">
        {section.imageUrl && (
          <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-12 shadow-lg group">
            <Image
              src={section.imageUrl}
              alt="Recovery room facilities"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/60 via-secondary-900/20 to-transparent" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {section.rooms.map((room, index) => {
            const name = getLocalizedField(room.name, locale)
            const description = getLocalizedField(room.description, locale)

            return (
              <div
                key={index}
                className="glass-card p-6 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{name}</h3>
                  <p className="text-gray-600 text-sm">{description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
