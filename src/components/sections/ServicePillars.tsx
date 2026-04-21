import { Fragment } from 'react'
import { ServicePillarsSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Block 1 — ASSESS / PREVENT / RESPOND
// ---------------------------------------------------------------------------
const STEPS = [
  {
    name: 'ASSESS',
    subtitle: 'Identify your risks and critical vulnerabilities',
    description:
      'We analyse your business processes, infrastructure and exposure to ensure the right continuity strategy.',
  },
  {
    name: 'PREVENT',
    subtitle: 'Protect your operations before disruption occurs',
    description:
      'From cybersecurity to data protection, we secure your environment and reduce the likelihood of incidents.',
  },
  {
    name: 'RESPOND',
    subtitle: 'Stay operational when disruption happens',
    description:
      'We provide secure environments, recovery solutions and crisis support to keep your business running.',
  },
]

// ---------------------------------------------------------------------------
// Block 2 — Solutions for expert visitors
// ---------------------------------------------------------------------------
const SOLUTIONS = [
  {
    title: 'Consultancy & Training',
    description:
      'Assess risks, define strategies and train your teams across the full continuity lifecycle',
    href: '/services/consultancy-and-training',
  },
  {
    title: 'Recovery Workplaces',
    description:
      'Access fully equipped offices to resume operations within hours after disruption',
    href: '/services/recovery-workplaces',
  },
  {
    title: 'Crisis Management',
    description:
      'Prepare for and manage critical situations with dedicated facilities and expert support',
    href: '/services/crisis-management',
  },
  {
    title: 'IT Housing',
    description:
      'Secure and resilient infrastructure hosting in Luxembourg with high availability and redundancy',
    href: '/services/it-housing',
  },
  {
    title: 'Cyber Resilience',
    description:
      'Prevent, detect and respond to cyber threats with advanced protection and recovery solutions',
    href: '/services/cyberresilience',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface ServicePillarsProps {
  section: ServicePillarsSection
  locale: Locale
}

export default function ServicePillars({ section, locale }: ServicePillarsProps) {
  return (
    <>
      {/* ================================================================= */}
      {/* BLOCK 1 — How we ensure your business continuity                  */}
      {/* ================================================================= */}
      <section className="py-20 bg-warm-50">
        <div className="container-padding">
          {/* Heading */}
          <div className="mb-14 max-w-3xl">
            <div className="w-12 h-1 bg-accent-500 mb-6" />
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
              How we ensure your business continuity
            </h2>
          </div>

          {/* 3 step cards with arrows */}
          <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-4">
            {STEPS.map((step, index) => (
              <Fragment key={step.name}>
                <div className="flex flex-col flex-1">
                  <h3 className="text-lg font-bold uppercase tracking-wide text-primary-900 mb-2">
                    {step.name}
                  </h3>
                  <p className="text-sm font-semibold text-secondary-700 mb-3">
                    {step.subtitle}
                  </p>
                  <p className="text-sm text-secondary-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
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
      {/* BLOCK 2 — Our solutions                                           */}
      {/* ================================================================= */}
      <section className="py-20 bg-primary-900">
        <div className="container-padding">
          {/* Heading */}
          <div className="mb-14 max-w-3xl">
            <div className="w-12 h-1 bg-accent-500 mb-6" />
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
              Our solutions
            </h2>
            <p className="text-base text-white/70 mb-2">
              Looking for specific solutions?
            </p>
            <p className="text-base text-white/80 leading-relaxed">
              Explore our full range of business continuity and cyber resilience services
            </p>
          </div>

          {/* 5 solution links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOLUTIONS.map((solution) => (
              <Link
                key={solution.href}
                href={solution.href}
                className="group flex flex-col justify-between rounded-xl border border-white/15 bg-white/5 p-6 transition-all duration-200 hover:bg-white/10 hover:border-accent-500/60"
              >
                <div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-accent-400 transition-colors">
                    {solution.title}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-4">
                    {solution.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-accent-400">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
