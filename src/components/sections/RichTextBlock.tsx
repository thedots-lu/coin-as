import { getLocalizedField } from '@/lib/locale'
import { RichTextSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'

interface RichTextBlockProps {
  section: RichTextSection
  locale: Locale
}

export default function RichTextBlock({ section, locale }: RichTextBlockProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section className="py-16">
      <div className="container-padding max-w-3xl mx-auto">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{heading}</h2>
        )}
        {body && (
          <div
            className="text-gray-700 leading-relaxed text-lg"
            style={{ whiteSpace: 'pre-line' }}
          >
            {body}
          </div>
        )}
      </div>
    </section>
  )
}
