import { ServicePillarsSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Block 1 — ASSESS / PREVENT / RESPOND
// ---------------------------------------------------------------------------
const STEPS = [
  {
    number: '01',
    name: 'ASSESS',
    subtitle: 'Identify your risks and critical vulnerabilities',
    description:
      'We analyse your business processes, infrastructure and exposure to ensure the right continuity strategy.',
  },
  {
    number: '02',
    name: 'PREVENT',
    subtitle: 'Protect your operations before disruption occurs',
    description:
      'From cybersecurity to data protection, we secure your environment and reduce the likelihood of incidents.',
  },
  {
    number: '03',
    name: 'RESPOND',
    subtitle: 'Stay operational when disruption happens',
    description:
      'We provide secure environments, recovery solutions and crisis support to keep your business running.',
  },
]

// ---------------------------------------------------------------------------
// Block 2 — Value propositions for non-expert visitors
// ---------------------------------------------------------------------------
const VALUE_PROPS = [
  {
    title: 'Business Continuity',
    description:
      'Keep your operations running and minimise disruption from unexpected events',
  },
  {
    title: 'Cyber Resilience',
    description:
      'Prevent, withstand and recover from cyber incidents and ransomware attacks',
  },
  {
    title: 'Regulatory Compliance',
    description:
      'Meet evolving regulatory requirements with the right tools, processes and safeguards',
  },
]

// ---------------------------------------------------------------------------
// Block 3 — Solutions for expert visitors
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

          {/* 3 step cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col">
                <span className="font-display text-5xl font-bold text-accent-500 mb-4">
                  {step.number}
                </span>
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
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* BLOCK 2 — Protect what matters most                               */}
      {/* ================================================================= */}
      <section className="py-20 bg-white">
        <div className="container-padding">
          {/* Heading */}
          <div className="mb-14 max-w-3xl">
            <div className="w-12 h-1 bg-accent-500 mb-6" />
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight mb-4">
              Protect what matters most
            </h2>
            <p className="text-base text-secondary-500 mb-2">
              Not sure where to start? We've got you covered.
            </p>
            <p className="text-base font-semibold text-secondary-700">
              COIN AS helps you strengthen what matters most:
            </p>
          </div>

          {/* 3 value propositions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {VALUE_PROPS.map((item) => (
              <div key={item.title} className="flex flex-col">
                <div className="w-10 h-1 bg-accent-500 mb-5" />
                <h3 className="text-lg font-bold text-primary-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-secondary-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* BLOCK 3 — Our solutions                                           */}
      {/* ================================================================= */}
      <section className="py-20 bg-warm-50">
        <div className="container-padding">
          {/* Heading */}
          <div className="mb-14 max-w-3xl">
            <div className="w-12 h-1 bg-accent-500 mb-6" />
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight mb-4">
              Our solutions
            </h2>
            <p className="text-base text-secondary-500 mb-2">
              Looking for specific solutions?
            </p>
            <p className="text-base text-secondary-600 leading-relaxed">
              Explore our full range of business continuity and cyber resilience services
            </p>
          </div>

          {/* 5 solution links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOLUTIONS.map((solution) => (
              <Link
                key={solution.href}
                href={solution.href}
                className="group flex flex-col justify-between rounded-xl border border-secondary-200 bg-white p-6 transition-all duration-200 hover:shadow-lg hover:border-accent-500/40"
              >
                <div>
                  <h3 className="text-base font-bold text-primary-900 mb-2 group-hover:text-accent-600 transition-colors">
                    {solution.title}
                  </h3>
                  <p className="text-sm text-secondary-600 leading-relaxed mb-4">
                    {solution.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-accent-600">
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
