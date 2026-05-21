'use client'

import { FreeTextSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import RichInlineText from '@/components/admin/cms/RichInlineText'

interface Props {
  section: FreeTextSection
  locale: Locale
  basePath: string
}

/**
 * Heading-less inline-rich text block at the default prose size. Mirrors
 * PageIntro's layout container but without the large title and `prose-lg`
 * bump, so it reads as ordinary body copy.
 */
export default function FreeText({ section, basePath }: Props) {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container-padding max-w-6xl mx-auto">
        <div className="max-w-4xl">
          <RichInlineText
            path={`${basePath}.body`}
            value={section.body}
            className="prose max-w-none text-secondary-700 leading-relaxed prose-strong:text-secondary-800 prose-li:marker:text-accent-500 [&_p]:my-4 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
          />
        </div>
      </div>
    </section>
  )
}
