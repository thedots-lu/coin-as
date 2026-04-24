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

const CARD_PROSE_CLASSES =
  'prose prose-sm max-w-none text-secondary-700 prose-strong:text-secondary-800 prose-li:marker:text-accent-500 [&_li>p]:my-0 [&_li]:my-[-0.3rem] [&_p]:my-2'

const STANDARD_WORKPLACE_MARKERS = [
  '**Workstation setup**',
  '**Common areas (included at no additional cost)**',
  '**Security and access**',
  '**The numbers**',
  '**Benefits of Disaster Recovery Site managed with COIN**',
  '**Flexible Options COIN**',
]

function splitStandardWorkplaceBody(body: string) {
  const positions = STANDARD_WORKPLACE_MARKERS.map((m) => body.indexOf(m))
  if (positions.some((p) => p === -1)) return null

  const intro = body.slice(0, positions[0]).trim()
  const cards = STANDARD_WORKPLACE_MARKERS.map((marker, i) => {
    const start = positions[i] + marker.length
    const end = i < STANDARD_WORKPLACE_MARKERS.length - 1 ? positions[i + 1] : body.length
    return {
      title: marker.replace(/\*\*/g, ''),
      content: body.slice(start, end).trim(),
    }
  })

  return { intro, cards }
}

export default function RichTextBlock({ section, locale }: RichTextBlockProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)
  const cardLayout = heading === 'Standard workplace equipment' && body ? splitStandardWorkplaceBody(body) : null

  return (
    <section className="py-16">
      <div className={`container-padding mx-auto ${cardLayout ? 'max-w-6xl' : 'max-w-3xl'}`}>
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-900 font-display">{heading}</h2>
        )}
        {cardLayout ? (
          <>
            {cardLayout.intro && (
              <div className={PROSE_CLASSES}>
                <Markdown>{cardLayout.intro}</Markdown>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {cardLayout.cards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-secondary-100 flex flex-col"
                >
                  <div className="w-10 h-1 bg-accent-500 rounded-full mb-4" />
                  <h3 className="font-display text-xl font-bold text-primary-900 leading-tight mb-4">
                    {card.title}
                  </h3>
                  <div className={CARD_PROSE_CLASSES}>
                    <Markdown>{card.content}</Markdown>
                  </div>
                </div>
              ))}
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
