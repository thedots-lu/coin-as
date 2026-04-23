import { getLocalizedField } from '@/lib/locale'
import { RichTextSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Markdown from 'react-markdown'

interface RichTextBlockProps {
  section: RichTextSection
  locale: Locale
}

const PROSE_CLASSES =
  'prose prose-lg max-w-none text-secondary-700 prose-headings:text-primary-900 prose-headings:font-display prose-strong:text-secondary-800 prose-li:marker:text-accent-500 [&_li>p]:my-0 [&_li]:my-[-0.4rem]'

function splitStandardWorkplaceBody(body: string) {
  const workstationIdx = body.indexOf('**Workstation setup**')
  const securityIdx = body.indexOf('**Security and access**')
  if (workstationIdx === -1 || securityIdx === -1) return null
  return {
    intro: body.slice(0, workstationIdx).trim(),
    left: body.slice(workstationIdx, securityIdx).trim(),
    right: body.slice(securityIdx).trim(),
  }
}

export default function RichTextBlock({ section, locale }: RichTextBlockProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)
  const splitLayout = heading === 'Standard workplace equipment' && body ? splitStandardWorkplaceBody(body) : null

  return (
    <section className="py-16">
      <div className={`container-padding mx-auto ${splitLayout ? 'max-w-5xl' : 'max-w-3xl'}`}>
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-900 font-display">{heading}</h2>
        )}
        {splitLayout ? (
          <>
            {splitLayout.intro && (
              <div className={PROSE_CLASSES}>
                <Markdown>{splitLayout.intro}</Markdown>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 md:gap-x-12 mt-8">
              <div className={PROSE_CLASSES}>
                <Markdown>{splitLayout.left}</Markdown>
              </div>
              <div className={PROSE_CLASSES}>
                <Markdown>{splitLayout.right}</Markdown>
              </div>
            </div>
          </>
        ) : (
          body && (
            <div className={PROSE_CLASSES}>
              <Markdown>{body}</Markdown>
            </div>
          )
        )}
      </div>
    </section>
  )
}
