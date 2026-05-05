'use client'

import { Check, type LucideIcon } from 'lucide-react'
import { resolveFeatureIcon } from '@/lib/icons'
import { FeaturesListSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'
import EditableText from '@/components/admin/cms/EditableText'
import RichInlineText from '@/components/admin/cms/RichInlineText'

interface FeaturesSectionProps {
  section: FeaturesListSection
  locale: Locale
  basePath?: string
}

function resolveIcon(name?: string | null): LucideIcon {
  if (!name) return Check
  return resolveFeatureIcon(name) ?? Check
}

export default function FeaturesSection({ section, basePath = '' }: FeaturesSectionProps) {
  return (
    <section className="py-16 md:py-20 bg-warm-50">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection animation="slideUp" className="mb-12">
            <div className="w-12 h-1 bg-accent-500 rounded-full mb-5" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 font-display leading-tight tracking-tight">
              <EditableText
                path={`${basePath}.heading`}
                value={section.heading}
                as="span"
                multiline
              />
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {section.features.map((feature, index) => {
              const Icon = resolveIcon(feature.icon)

              return (
                <AnimatedSection key={index} animation="slideUp" delay={index * 0.08}>
                  <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-secondary-100 h-full hover:shadow-md transition-shadow duration-300">
                    <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center shrink-0 mb-4">
                      <Icon className="w-5 h-5 text-accent-600" strokeWidth={2.5} />
                    </div>
                    <p className="text-base md:text-lg text-primary-900 font-normal leading-snug mb-2">
                      <EditableText
                        path={`${basePath}.features.${index}.title`}
                        value={feature.title}
                        as="span"
                        multiline
                      />
                    </p>
                    <RichInlineText
                      path={`${basePath}.features.${index}.description`}
                      value={feature.description}
                      className="text-secondary-600 leading-relaxed text-sm md:text-base prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5"
                    />
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
