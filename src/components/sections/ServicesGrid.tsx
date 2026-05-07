'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase, Info } from 'lucide-react'
import { ServicesGridSection } from '@/lib/types/page'
import { ServiceCardAccent, ServiceDocument } from '@/lib/types/service'
import { Locale } from '@/lib/types/locale'
import { getLocalizedField } from '@/lib/locale'
import { resolveFeatureIcon } from '@/lib/icons'
import { isExternalUrl } from '@/lib/utils/links'
import { resolveCtaLabel } from '@/lib/utils/cta-labels'
import { sanitizeRichHtml } from '@/lib/utils/html'
import EditableText from '@/components/admin/cms/EditableText'
import { useEditing } from '@/components/admin/cms/EditingContext'

interface ServicesGridProps {
  section: ServicesGridSection
  locale: Locale
  basePath: string
  services?: ServiceDocument[]
}

const ACCENT_CLASSES: Record<ServiceCardAccent, { bar: string; iconBg: string; iconColor: string }> = {
  primary: { bar: 'bg-primary-500', iconBg: 'bg-primary-50', iconColor: 'text-primary-600' },
  accent: { bar: 'bg-accent-500', iconBg: 'bg-accent-50', iconColor: 'text-accent-600' },
  red: { bar: 'bg-coin-red-500', iconBg: 'bg-coin-red-50', iconColor: 'text-coin-red-600' },
  'primary-dark': { bar: 'bg-primary-700', iconBg: 'bg-primary-50', iconColor: 'text-primary-700' },
}

const HIDDEN_FROM_GRID = new Set(['overview'])

export default function ServicesGrid({ section, locale, basePath, services }: ServicesGridProps) {
  const isEditing = !!useEditing()
  const cards = (services ?? [])
    .filter((s) => !HIDDEN_FROM_GRID.has(s.slug ?? s.id))
    .filter((s) => !!s.card)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <section id="services" className="bg-warm-50 py-16 md:py-20 scroll-mt-24">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          {isEditing && (
            <div className="mb-8 flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
              <p>
                Cards are auto-generated from published services. To edit a card&apos;s body,
                icon or accent, open the matching service page (e.g. Recovery Workplaces) and use
                the <strong>Page settings</strong> button in the toolbar.
              </p>
            </div>
          )}
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-900 mb-12 text-center">
            <EditableText
              path={`${basePath}.heading`}
              value={section.heading}
              as="span"
              multiline
            />
          </h2>

          {cards.length === 0 ? (
            <p className="text-center text-secondary-600 text-lg">Services coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {cards.map((service) => {
                const slug = service.slug ?? service.id
                const card = service.card!
                const accent = ACCENT_CLASSES[card.accent ?? 'primary']
                const Icon = resolveFeatureIcon(card.icon) ?? Briefcase
                const cardTitle = getLocalizedField(card.title, locale)
                const title = cardTitle || getLocalizedField(service.title, locale)
                const body = getLocalizedField(card.body, locale)
                const articleHref = service.articleHref?.trim() || ''
                const articleLabel = articleHref
                  ? resolveCtaLabel(undefined, articleHref, locale)
                  : ''
                const articleExternal = articleHref ? isExternalUrl(articleHref) : false

                return (
                  <div
                    key={slug}
                    className="group relative bg-white rounded-2xl p-8 shadow-sm border border-secondary-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    {/* Stretched link: covers the whole card so clicks
                        outside the article CTA navigate to the service. */}
                    <Link
                      href={`/services/${slug}`}
                      aria-label={title}
                      className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    />
                    <div className={`absolute top-0 left-8 right-8 h-1 ${accent.bar} rounded-b-full`} />
                    <div className="flex items-start gap-4 mb-4 pt-2">
                      <div
                        className={`w-12 h-12 rounded-xl ${accent.iconBg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`w-6 h-6 ${accent.iconColor}`} strokeWidth={2} />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="font-display text-2xl font-bold text-primary-900 leading-tight group-hover:text-primary-600 transition-colors">
                          {title}
                        </h3>
                      </div>
                    </div>
                    {body && (
                      <div
                        className="text-secondary-700 leading-relaxed mb-6 ml-16 prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-2 [&_li]:my-0.5 [&_li]:marker:text-accent-500"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(body) }}
                      />
                    )}
                    <div className="ml-16 mt-auto flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:text-primary-800 transition-colors">
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                      {articleHref && (
                        articleExternal ? (
                          <a
                            href={articleHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-20 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                          >
                            <span>{articleLabel}</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        ) : (
                          <Link
                            href={articleHref}
                            className="relative z-20 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                          >
                            <span>{articleLabel}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
