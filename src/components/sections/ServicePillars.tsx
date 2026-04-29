'use client'

import { Fragment, useEffect } from 'react'
import { ServicePillarsSection } from '@/lib/types/page'
import { LocaleString, createEmptyLocaleString, Locale } from '@/lib/types/locale'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import EditableText from '@/components/admin/cms/EditableText'
import EditableLink from '@/components/admin/cms/EditableLink'
import { useEditing } from '@/components/admin/cms/EditingContext'
import { isExternalUrl } from '@/lib/utils/links'

// Defaults used when Firestore section data is missing or empty.
// The visual CMS fills these into the document on first edit.
const ls = (en: string): LocaleString => ({ ...createEmptyLocaleString(), en })

const FALLBACK_STEPS_HEADING: LocaleString = ls(
  'Your business continuity is our mission, from risk assessment to recovery',
)

const FALLBACK_STEPS = [
  {
    name: ls('ASSESS'),
    subtitle: ls('Identify your risks and disruption scenarios'),
    description: ls(
      'We analyse your business processes, regulatory obligations and define the right business continuity strategy.',
    ),
  },
  {
    name: ls('PREPARE'),
    subtitle: ls('Prepare for disruption and reduce their impacts'),
    description: ls(
      'From natural disaster to human caused incidents or phishing, we help you to prevent and get you ready and trained to manage the crisis and minimize its impact.',
    ),
  },
  {
    name: ls('RESPOND'),
    subtitle: ls('Continue to work and resume operations in case of disruption.'),
    description: ls(
      'We provide secure environments, physical and digital recovery solutions and crisis support.',
    ),
  },
]

const FALLBACK_SOLUTIONS_HEADING: LocaleString = ls('Our solutions')

const FALLBACK_SOLUTIONS = [
  {
    title: ls('Consultancy & Training'),
    description: ls(
      'Business Impact Analysis, Continuity Plans, Crisis Management and Disaster Simulation Exercices.',
    ),
    href: '/services/consultancy-and-training',
  },
  {
    title: ls('Recovery Workplaces'),
    description: ls(
      '24x7 available fully equipped offices to resume operations within hours, or for special projects.',
    ),
    href: '/services/recovery-workplaces',
  },
  {
    title: ls('Crisis Management'),
    description: ls(
      'Prepare for and manage crisis with expert support, crisis management facilities and war rooms.',
    ),
    href: '/services/crisis-management',
  },
  {
    title: ls('IT Housing'),
    description: ls(
      'Secure and resilient DRP hosting in Luxembourg with co-located recovery offices.',
    ),
    href: '/services/it-housing',
  },
  {
    title: ls('Cyber Resilience'),
    description: ls(
      'Prevent phishing attacks, Clean Azure tenant, recovery laptops, and recovery USB keys.',
    ),
    href: '/services/cyberresilience',
  },
]

interface ServicePillarsProps {
  section: ServicePillarsSection
  locale: Locale
  basePath: string
}

export default function ServicePillars({ section, basePath }: ServicePillarsProps) {
  const ctx = useEditing()
  const isEditing = !!ctx

  const stepsHeading = section.stepsHeading ?? FALLBACK_STEPS_HEADING
  const steps = section.steps && section.steps.length > 0 ? section.steps : FALLBACK_STEPS
  const stepsMissingInDraft = !section.steps || section.steps.length === 0

  const solutionsHeading = section.solutionsHeading ?? FALLBACK_SOLUTIONS_HEADING
  const solutions =
    section.solutions && section.solutions.length > 0 ? section.solutions : FALLBACK_SOLUTIONS
  const solutionsMissingInDraft = !section.solutions || section.solutions.length === 0

  // When the visual CMS opens this section for the first time, seed the
  // defaults into the draft so per-card EditableText fields have a real path
  // to write to. The save button then persists the structure to Firestore.
  // Idempotent: once steps/solutions exist on the section, the effect no-ops.
  useEffect(() => {
    if (!ctx || !isEditing) return
    if (stepsMissingInDraft) {
      ctx.updateAt(`${basePath}.stepsHeading`, section.stepsHeading ?? FALLBACK_STEPS_HEADING)
      ctx.updateAt(`${basePath}.steps`, FALLBACK_STEPS)
    }
    if (solutionsMissingInDraft) {
      ctx.updateAt(
        `${basePath}.solutionsHeading`,
        section.solutionsHeading ?? FALLBACK_SOLUTIONS_HEADING,
      )
      ctx.updateAt(`${basePath}.solutions`, FALLBACK_SOLUTIONS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, stepsMissingInDraft, solutionsMissingInDraft])

  return (
    <>
      {/* ================================================================= */}
      {/* BLOCK 1 — Lifecycle steps                                         */}
      {/* ================================================================= */}
      <section className="py-20 bg-warm-50">
        <div className="container-padding">
          <div className="mb-14 max-w-3xl">
            <div className="w-12 h-1 bg-accent-500 mb-6" />
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
              <EditableText
                path={`${basePath}.stepsHeading`}
                value={stepsHeading}
                as="span"
                multiline
              />
            </h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-4">
            {steps.map((step, index) => (
              <Fragment key={index}>
                <div className="flex flex-col flex-1">
                  <h3 className="text-lg font-bold uppercase tracking-wide text-primary-900 mb-2">
                    <EditableText
                      path={`${basePath}.steps.${index}.name`}
                      value={step.name}
                      as="span"
                    />
                  </h3>
                  <p className="text-sm font-semibold text-secondary-700 mb-3">
                    <EditableText
                      path={`${basePath}.steps.${index}.subtitle`}
                      value={step.subtitle}
                      as="span"
                      multiline
                    />
                  </p>
                  <p className="text-sm text-secondary-600 leading-relaxed">
                    <EditableText
                      path={`${basePath}.steps.${index}.description`}
                      value={step.description}
                      as="span"
                      multiline
                    />
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex items-center justify-center py-2 md:py-0">
                    <ChevronRight
                      className="w-12 h-12 text-accent-500 rotate-90 md:rotate-0 shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* BLOCK 2 — Solutions catalog                                       */}
      {/* ================================================================= */}
      <section className="py-20 bg-primary-900">
        <div className="container-padding">
          <div className="mb-14 max-w-3xl">
            <div className="w-12 h-1 bg-accent-500 mb-6" />
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
              <EditableText
                path={`${basePath}.solutionsHeading`}
                value={solutionsHeading}
                as="span"
                multiline
              />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution, index) => {
              const card = (
                <>
                  <div>
                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-accent-400 transition-colors">
                      <EditableText
                        path={`${basePath}.solutions.${index}.title`}
                        value={solution.title}
                        as="span"
                      />
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed mb-4">
                      <EditableText
                        path={`${basePath}.solutions.${index}.description`}
                        value={solution.description}
                        as="span"
                        multiline
                      />
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-accent-400">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </>
              )

              const cardClass =
                'group flex flex-col justify-between rounded-xl border border-white/15 bg-white/5 p-6 transition-all duration-200 hover:bg-white/10 hover:border-accent-500/60'

              if (isEditing) {
                return (
                  <div key={index} className={`${cardClass} relative`}>
                    {card}
                    <div className="mt-3">
                      <EditableLink
                        path={`${basePath}.solutions.${index}.href`}
                        value={solution.href}
                        label="Card link"
                      />
                    </div>
                  </div>
                )
              }
              const external = isExternalUrl(solution.href)
              return external ? (
                <a
                  key={index}
                  href={solution.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  {card}
                </a>
              ) : (
                <Link key={index} href={solution.href} className={cardClass}>
                  {card}
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
