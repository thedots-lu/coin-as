'use client'

import { Briefcase } from 'lucide-react'
import { IconCardGridSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import { getLocalizedField } from '@/lib/locale'
import { resolveFeatureIcon } from '@/lib/icons'
import EditableText from '@/components/admin/cms/EditableText'
import RichInlineText from '@/components/admin/cms/RichInlineText'
import { useEditing } from '@/components/admin/cms/EditingContext'

interface Props {
  section: IconCardGridSection
  locale: Locale
  basePath: string
}

const ACCENT_CLASSES: Record<
  NonNullable<IconCardGridSection['cards'][number]['accent']>,
  { iconBg: string; iconColor: string }
> = {
  primary: { iconBg: 'bg-primary-50', iconColor: 'text-primary-600' },
  accent: { iconBg: 'bg-accent-50', iconColor: 'text-accent-600' },
  red: { iconBg: 'bg-coin-red-50', iconColor: 'text-coin-red-600' },
  'primary-dark': { iconBg: 'bg-primary-50', iconColor: 'text-primary-700' },
}

export default function IconCardGrid({ section, locale, basePath }: Props) {
  const isEditing = !!useEditing()
  const intro = getLocalizedField(section.intro, locale)
  const cards = section.cards ?? []

  const gridCols =
    cards.length <= 2
      ? 'grid-cols-1 md:grid-cols-2'
      : cards.length === 3
        ? 'grid-cols-1 md:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2'

  return (
    <section className="py-16 md:py-20 bg-warm-50">
      <div className="container-padding mx-auto max-w-6xl">
        <div className="w-12 h-1 bg-accent-500 rounded-full mb-5" />
        <h2 className="text-3xl md:text-4xl font-bold text-primary-900 font-display leading-tight tracking-tight mb-4">
          <EditableText
            path={`${basePath}.heading`}
            value={section.heading}
            as="span"
            multiline
          />
        </h2>
        {(intro || isEditing) && (
          <div className="max-w-3xl mb-10">
            <RichInlineText
              path={`${basePath}.intro`}
              value={section.intro}
              className="text-secondary-700 text-lg leading-relaxed prose max-w-none [&_p]:my-1"
            />
          </div>
        )}
        <div className={`grid ${gridCols} gap-6 md:gap-8`}>
          {cards.map((card, index) => {
            const Icon = resolveFeatureIcon(card.icon) ?? Briefcase
            const accent = ACCENT_CLASSES[card.accent ?? 'accent']
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-secondary-100 hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`w-11 h-11 rounded-lg ${accent.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${accent.iconColor}`} strokeWidth={2.25} />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-primary-900 font-display leading-snug">
                    <EditableText
                      path={`${basePath}.cards.${index}.title`}
                      value={card.title}
                      as="span"
                      multiline
                    />
                  </h3>
                </div>
                <RichInlineText
                  path={`${basePath}.cards.${index}.body`}
                  value={card.body}
                  className="prose prose-sm max-w-none text-secondary-700 prose-strong:text-secondary-800 prose-li:marker:text-accent-500 [&_ul]:my-0 [&_li>p]:my-0 [&_li]:my-1 [&_p]:my-2 [&_p]:leading-relaxed"
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
