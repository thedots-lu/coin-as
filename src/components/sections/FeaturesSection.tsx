'use client'

import Link from 'next/link'
import { ArrowRight, Check, FileText, type LucideIcon } from 'lucide-react'
import { resolveFeatureIcon } from '@/lib/icons'
import { FeaturesListSection } from '@/lib/types/page'
import { Locale, LocaleString } from '@/lib/types/locale'
import { getLocalizedField } from '@/lib/locale'
import { isExternalUrl } from '@/lib/utils/links'
import {
  type CtaKindChoice,
  resolveCtaLabel,
} from '@/lib/utils/cta-labels'
import AnimatedSection from '@/components/ui/AnimatedSection'
import EditableText from '@/components/admin/cms/EditableText'
import RichInlineText from '@/components/admin/cms/RichInlineText'
import EditableLink from '@/components/admin/cms/EditableLink'
import { useEditing } from '@/components/admin/cms/EditingContext'

interface FeaturesSectionProps {
  section: FeaturesListSection
  locale: Locale
  basePath?: string
}

function resolveIcon(name?: string | null): LucideIcon {
  if (!name) return Check
  return resolveFeatureIcon(name) ?? Check
}

function ArticleLink({
  href,
  kind,
  customLabel,
  locale,
}: {
  href: string
  kind?: CtaKindChoice
  customLabel?: LocaleString
  locale: Locale
}) {
  const className =
    'inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors group/article'
  const label = resolveCtaLabel(kind, href, locale, customLabel)
  const content = (
    <>
      <FileText className="w-3.5 h-3.5" />
      <span>{label}</span>
      <ArrowRight className="w-3.5 h-3.5 group-hover/article:translate-x-0.5 transition-transform" />
    </>
  )
  return isExternalUrl(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}

const FEATURES_COLUMNS_CLASS = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
} as const

export default function FeaturesSection({ section, locale, basePath = '' }: FeaturesSectionProps) {
  const isEditing = !!useEditing()
  const autoColumns: 3 | 4 = section.features.length === 3 ? 3 : 4
  const gridCols = FEATURES_COLUMNS_CLASS[section.columnsPerRow ?? autoColumns]
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

          <div className={`grid ${gridCols} gap-6 md:gap-8`}>
            {section.features.map((feature, index) => {
              const Icon = resolveIcon(feature.icon)
              // When the feature has a real description, the title is a short
              // label and should stand out (bold). When the description is
              // empty (Overview "Advisory Services" cards), the title carries
              // the whole content and reads better at body weight.
              const hasDescription = !!getLocalizedField(feature.description, locale).trim()
              const titleClass = hasDescription
                ? 'text-base md:text-lg text-primary-900 font-semibold leading-snug mb-3'
                : 'text-base md:text-lg text-primary-900 font-normal leading-snug mb-2'

              return (
                <AnimatedSection key={index} animation="slideUp" delay={index * 0.08}>
                  <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-secondary-100 h-full hover:shadow-md transition-shadow duration-300">
                    <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center shrink-0 mb-4">
                      <Icon className="w-5 h-5 text-accent-600" strokeWidth={2.5} />
                    </div>
                    <p className={titleClass}>
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
                      className="prose prose-sm max-w-none text-secondary-700 prose-strong:text-secondary-800 prose-li:marker:text-accent-500 [&_ul]:my-0 [&_li>p]:my-0 [&_li]:my-1 [&_p]:my-2 [&_p]:leading-relaxed"
                    />
                    {(feature.articleHref1 || feature.articleHref2 || isEditing) && (
                      <div className="mt-4 flex flex-col gap-2">
                        {feature.articleHref1 && (
                          <ArticleLink
                            href={feature.articleHref1}
                            kind={feature.articleKind1}
                            customLabel={feature.articleLabel1}
                            locale={locale}
                          />
                        )}
                        {feature.articleHref2 && (
                          <ArticleLink
                            href={feature.articleHref2}
                            kind={feature.articleKind2}
                            customLabel={feature.articleLabel2}
                            locale={locale}
                          />
                        )}
                        {isEditing && (
                          <div className="flex flex-col gap-2 mt-1">
                            <EditableLink
                              path={`${basePath}.features.${index}.articleHref1`}
                              value={feature.articleHref1}
                              label="Article link 1"
                              ctaKindPath={`${basePath}.features.${index}.articleKind1`}
                              ctaKind={feature.articleKind1}
                              ctaLabelPath={`${basePath}.features.${index}.articleLabel1`}
                              ctaCustomLabel={feature.articleLabel1}
                            />
                            <EditableLink
                              path={`${basePath}.features.${index}.articleHref2`}
                              value={feature.articleHref2}
                              label="Article link 2"
                              ctaKindPath={`${basePath}.features.${index}.articleKind2`}
                              ctaKind={feature.articleKind2}
                              ctaLabelPath={`${basePath}.features.${index}.articleLabel2`}
                              ctaCustomLabel={feature.articleLabel2}
                            />
                          </div>
                        )}
                      </div>
                    )}
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
