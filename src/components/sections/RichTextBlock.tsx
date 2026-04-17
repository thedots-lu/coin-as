import { getLocalizedField } from '@/lib/locale'
import { RichTextSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Markdown from 'react-markdown'

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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-900 font-display">{heading}</h2>
        )}
        {body && (
          <div className="prose prose-lg max-w-none text-secondary-700 prose-headings:text-primary-900 prose-headings:font-display prose-strong:text-secondary-800 prose-li:marker:text-accent-500 [&_li>p]:my-0 [&_li]:my-[-0.4rem]">
            <Markdown>{body}</Markdown>
          </div>
        )}
      </div>
    </section>
  )
}
