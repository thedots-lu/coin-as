'use client'

import { PageIntroSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import EditableText from '@/components/admin/cms/EditableText'
import RichInlineText from '@/components/admin/cms/RichInlineText'

interface Props {
  section: PageIntroSection
  locale: Locale
  basePath: string
}

export default function PageIntro({ section, basePath }: Props) {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container-padding max-w-6xl mx-auto">
        <div className="max-w-4xl">
          <div className="w-12 h-1 bg-accent-500 rounded-full mb-4" />
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight mb-6">
            <EditableText
              path={`${basePath}.heading`}
              value={section.heading}
              as="span"
              multiline
            />
          </h2>
          <RichInlineText
            path={`${basePath}.body`}
            value={section.body}
            className="prose prose-lg max-w-none text-secondary-700 leading-relaxed prose-strong:text-secondary-800 prose-li:marker:text-accent-500 [&_p]:my-4 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
          />
        </div>
      </div>
    </section>
  )
}
