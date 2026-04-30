import { ValuesSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import EditableText from '@/components/admin/cms/EditableText'
import RichInlineText from '@/components/admin/cms/RichInlineText'

interface ValuesGridProps {
  section: ValuesSection
  locale: Locale
  basePath: string
}

export default function ValuesGrid({ section, basePath }: ValuesGridProps) {
  const values = section.values ?? []

  return (
    <section id="values" className="py-20 bg-warm-50 scroll-mt-24">
      <div className="container-padding">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">
          <EditableText
            path={`${basePath}.heading`}
            value={section.heading}
            as="span"
            multiline
          />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((value, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-secondary-100"
            >
              <h3 className="text-xl font-semibold text-primary-600 mb-3">
                <EditableText
                  path={`${basePath}.values.${i}.title`}
                  value={value.title}
                  as="span"
                />
              </h3>
              <RichInlineText
                path={`${basePath}.values.${i}.description`}
                value={value.description}
                className="text-secondary-600 leading-relaxed prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
