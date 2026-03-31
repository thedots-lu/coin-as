import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'

type ChallengeData = {
  slug: string
  title: string
  subtitle: string
  heroImage: string
  intro: string
  context: string
  regulations: string[]
  threats: { title: string; description: string }[]
  coinSolutions: { title: string; description: string; href: string }[]
  testimonial?: { quote: string; author: string; role: string; company: string }
  relatedServices: { title: string; href: string }[]
}

const challengeData: Record<string, ChallengeData> = {
  'banking-finance': {
    slug: 'banking-finance',
    title: 'Banking & Finance',
    subtitle: 'Staying resilient under DORA, NIS2, CSSF & DNB requirements',
    heroImage: '/images/coin/coin-fotosharonwillems-33.webp',
    intro:
      'Financial institutions are among the most targeted organizations for cyber attacks and face the strictest regulatory requirements for operational resilience. COIN AS has been serving the financial sector for over 20 years.',
    context:
      'The Digital Operational Resilience Act (DORA) and NIS2 directive have set new mandatory standards for financial institutions operating in the EU. Organizations must demonstrate that they can withstand, respond to, and recover from ICT-related disruptions — with documented, tested Business Continuity Plans and dedicated recovery infrastructure.',
    regulations: [
      'DORA (Digital Operational Resilience Act) — mandatory from January 2025',
      'NIS2 Directive — critical sector cyber resilience requirements',
      'CSSF (Luxembourg) — operational resilience guidelines',
      'DNB (Netherlands) — business continuity requirements for financial institutions',
      'NBB (Belgium) — circular on operational risk management',
    ],
    threats: [
      {
        title: 'Ransomware & Cyber Attacks',
        description:
          'Financial institutions are prime targets. A successful attack can paralyze trading systems, lock client data, and trigger regulatory reporting obligations within hours.',
      },
      {
        title: 'Physical Site Unavailability',
        description:
          'Flooding, fire, power blackout, or building access restriction can make your primary offices unusable. You need a tested alternative in minutes, not days.',
      },
      {
        title: 'Telecom & IT Failure',
        description:
          'Dependency on cloud providers and telecom networks creates single points of failure. Redundant infrastructure and alternative connectivity are essential.',
      },
      {
        title: 'Regulatory Non-Compliance',
        description:
          'Failure to demonstrate a tested BCP can result in supervisory action, fines, and reputational damage with clients and counterparties.',
      },
    ],
    coinSolutions: [
      {
        title: 'Dedicated Recovery Workplaces',
        description:
          'Permanent, dedicated and fully equipped recovery seats at our Münsbach, Contern, Antwerp, and Amsterdam centers — available 24/7, tested annually.',
        href: '/services/recovery-workplaces',
      },
      {
        title: 'Business Continuity Consultancy',
        description:
          'Our senior experts help you build DORA-compliant BCPs, conduct BIA, define RTOs/RPOs, and run realistic disaster recovery exercises.',
        href: '/services/consultancy',
      },
      {
        title: 'Cyber Resilience Solutions',
        description:
          'Secure COIN Keys, alternative Azure tenants, and immutable backup solutions to recover from ransomware without paying the ransom.',
        href: '/services/cyber-resilience',
      },
      {
        title: 'Crisis Management Rooms',
        description:
          'Fully equipped, segregated crisis management facilities with redundant communications — ready for your incident command team within hours.',
        href: '/services/business-continuity',
      },
    ],
    testimonial: {
      quote:
        'COIN AS helped us achieve full DORA compliance and conduct our first cross-border disaster recovery exercise. The team understood our regulatory constraints and delivered exactly what we needed.',
      author: 'Thomas Van der Berg',
      role: 'Chief Risk Officer',
      company: 'BeNeLux Financial Group',
    },
    relatedServices: [
      { title: 'Recovery Workplaces', href: '/services/recovery-workplaces' },
      { title: 'Consultancy & Training', href: '/services/consultancy' },
      { title: 'Cyber Resilience', href: '/services/cyber-resilience' },
      { title: 'Co-location Services', href: '/services/co-location' },
    ],
  },
  insurance: {
    slug: 'insurance',
    title: 'Insurance',
    subtitle: 'Operational resilience when claims surge and offices close',
    heroImage: '/images/coin/coin-fotosharonwillems-58.webp',
    intro:
      'Insurance companies face a unique paradox: the exact events that disrupt their operations — storms, floods, pandemics — are also when client demand peaks. COIN AS ensures your claims and underwriting teams keep running.',
    context:
      'The insurance sector is increasingly regulated around operational resilience and data protection. With large claims-handling teams, distributed branch networks, and critical IT dependencies, insurers need tested and scalable business continuity solutions.',
    regulations: [
      'Solvency II — operational risk and business continuity requirements',
      'DORA — for insurance groups with significant IT dependencies',
      'RGPD / GDPR — client data protection during incidents',
      'EIOPA — supervisory guidelines on business continuity',
    ],
    threats: [
      {
        title: 'Catastrophic Event Coincidence',
        description:
          'A major storm or flood disrupts your offices precisely when your claims teams need to be at full capacity. Your clients cannot wait.',
      },
      {
        title: 'Ransomware on Policy Systems',
        description:
          'Core policy and claims management systems are high-value targets. Recovery time without tested backups can exceed weeks.',
      },
      {
        title: 'Hybrid Workforce Gaps',
        description:
          'Remote working creates new vulnerabilities: compromised home devices, unsecured connections, and lack of crisis communication infrastructure.',
      },
    ],
    coinSolutions: [
      {
        title: 'Shared Recovery Workplaces',
        description:
          'Rapidly deployable shared seats with customer-specific image deployment. Your claims team is operational within 2-4 hours of invocation.',
        href: '/services/recovery-workplaces',
      },
      {
        title: 'Secure BYOD Solutions',
        description:
          'Secure COIN Keys allow your staff to work securely from any device — home, hotel, or COIN center — without compromising corporate security.',
        href: '/services/cyber-resilience',
      },
      {
        title: 'Business Continuity Planning',
        description:
          'We help you define realistic disaster scenarios, map critical business processes, and build BCPs that pass regulatory scrutiny.',
        href: '/services/consultancy',
      },
    ],
    relatedServices: [
      { title: 'Shared Workplaces', href: '/services/recovery-workplaces' },
      { title: 'Cyber Resilience', href: '/services/cyber-resilience' },
      { title: 'BC Consultancy', href: '/services/consultancy' },
    ],
  },
  'utilities-energy': {
    slug: 'utilities-energy',
    title: 'Utilities & Energy',
    subtitle: 'Protecting critical infrastructure under NIS2',
    heroImage: '/images/coin/co-location-area-munsbach.webp',
    intro:
      'Energy grids, water networks, and utility operators are classified as critical infrastructure — making them prime targets for sophisticated cyber attacks and subject to the NIS2 directive\'s strictest requirements.',
    context:
      'The NIS2 Directive places utility companies among the "essential entities" subject to the highest level of security and resilience obligations. Organizations must implement robust incident response, business continuity planning, and supply chain security — with mandatory reporting within 24 hours of a significant incident.',
    regulations: [
      'NIS2 Directive — mandatory for essential and important entities',
      'ENTSO-E / ENTSO-G — resilience requirements for energy operators',
      'National energy regulator requirements (CREG, ACM, ILR)',
      'RGPD — for smart grid and metering data',
    ],
    threats: [
      {
        title: 'State-Sponsored Cyber Attacks',
        description:
          'Utility networks are targeted by nation-state actors seeking to disrupt essential services. These attacks are sophisticated, persistent, and aimed at SCADA/OT systems.',
      },
      {
        title: 'Physical Site Disruption',
        description:
          'Control rooms and operational centers must remain functional even when primary facilities are compromised by flooding, fire, or security incidents.',
      },
      {
        title: 'Supply Chain Vulnerabilities',
        description:
          'Third-party IT and OT vendors create indirect attack surfaces. Business continuity must account for supplier failures.',
      },
    ],
    coinSolutions: [
      {
        title: 'Dedicated Recovery Sites',
        description:
          'Secure, physically separate recovery facilities for your operational control teams — with redundant power, connectivity, and 24/7 access.',
        href: '/services/recovery-workplaces',
      },
      {
        title: 'Crisis Management Facilities',
        description:
          'Purpose-built crisis management rooms with multi-channel communications for coordinating incident response across your operational network.',
        href: '/services/business-continuity',
      },
      {
        title: 'NIS2 Compliance Consultancy',
        description:
          'Our consultants help you map NIS2 obligations to your operations, build compliant BCPs, and prepare for regulatory audits.',
        href: '/services/consultancy',
      },
    ],
    relatedServices: [
      { title: 'Dedicated Recovery Sites', href: '/services/recovery-workplaces' },
      { title: 'Crisis Management', href: '/services/business-continuity' },
      { title: 'NIS2 Consultancy', href: '/services/nis2-dora' },
    ],
  },
  'government-public': {
    slug: 'government-public',
    title: 'Government & Public Sector',
    subtitle: 'Continuity of essential public services and emergency management',
    heroImage: '/images/coin/coin-fotosharonwillems-26.webp',
    intro:
      'Public sector organizations — from tax authorities to emergency services — bear a duty to citizens that cannot be interrupted. COIN AS supports government agencies with the infrastructure and expertise to maintain essential services under any circumstances.',
    context:
      'Government entities are increasingly targeted by ransomware and politically motivated attacks. Simultaneously, they face budget constraints and legacy IT environments. COIN AS provides pragmatic, cost-effective business continuity solutions designed for public sector realities.',
    regulations: [
      'NIS2 — public administration entities as essential entities',
      'National civil security and crisis management legislation',
      'RGPD — data protection for citizen data',
      'ISO 27001 — information security management (COIN AS certified)',
    ],
    threats: [
      {
        title: 'Ransomware on Public IT',
        description:
          'Municipalities and public agencies have been hit by ransomware attacks that paralyzed citizen services for weeks. Recovery requires pre-positioned infrastructure.',
      },
      {
        title: 'Natural Disasters & Civil Unrest',
        description:
          'Flooding, storms, and civil emergencies can make government buildings inaccessible precisely when agencies must remain operational.',
      },
      {
        title: 'Legacy IT Dependencies',
        description:
          'Aging IT infrastructure increases vulnerability and complicates recovery. COIN AS helps bridge the gap with practical continuity solutions.',
      },
    ],
    coinSolutions: [
      {
        title: 'Flexible Recovery Workplaces',
        description:
          'Short-term and flexible workspace contracts suited to public sector procurement cycles and budget constraints.',
        href: '/services/recovery-workplaces',
      },
      {
        title: 'Secure Satellite Offices',
        description:
          'Permanent alternative office locations for distributed government teams — doubling as disaster recovery sites when needed.',
        href: '/services/satellite-offices',
      },
      {
        title: 'Business Continuity Training',
        description:
          'Awareness sessions and exercises for public sector teams — building a culture of resilience from the frontline to leadership.',
        href: '/services/training',
      },
    ],
    relatedServices: [
      { title: 'Flexible Workplaces', href: '/services/recovery-workplaces' },
      { title: 'Satellite Offices', href: '/services/satellite-offices' },
      { title: 'Training', href: '/services/training' },
      { title: 'Consultancy', href: '/services/consultancy' },
    ],
  },
}

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  return Object.keys(challengeData).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const data = challengeData[slug]
  if (!data) return {}
  return {
    title: `${data.title} | Business Continuity Challenges`,
    description: data.intro,
  }
}

export default async function ChallengePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const data = challengeData[slug]
  if (!data) notFound()

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden text-white py-28 md:py-36">
        <Image src={data.heroImage} alt={data.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/90 via-primary-900/80 to-primary-800/60" />
        <div className="container-padding relative z-10">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 text-primary-200 hover:text-white text-sm font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Challenges
          </Link>
          <p className="text-accent-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Sector Challenge
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{data.title}</h1>
          <p className="text-xl text-primary-100 max-w-2xl">{data.subtitle}</p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16">
        <div className="container-padding max-w-4xl">
          <p className="text-xl text-slate-600 leading-relaxed">{data.intro}</p>
        </div>
      </section>

      {/* Context & Regulations */}
      <section className="py-16 bg-primary-50">
        <div className="container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">The Regulatory Context</h2>
              <p className="text-slate-600 leading-relaxed mb-6">{data.context}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-primary-500">Key Regulations</h3>
              <ul className="space-y-3">
                {data.regulations.map((reg) => (
                  <li key={reg} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{reg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Threats */}
      <section className="py-16">
        <div className="container-padding">
          <h2 className="text-3xl font-bold mb-10 text-center">Key Threats You Face</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.threats.map((threat) => (
              <div key={threat.title} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-coin-red-50 flex items-center justify-center mb-4">
                  <span className="w-3 h-3 rounded-full bg-coin-red-500" />
                </div>
                <h3 className="font-bold mb-2 text-lg">{threat.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{threat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COIN Solutions */}
      <section className="py-16 bg-primary-950 text-white">
        <div className="container-padding">
          <h2 className="text-3xl font-bold mb-3 text-center">How COIN AS Helps</h2>
          <p className="text-primary-300 text-center mb-10 max-w-2xl mx-auto">
            Proven solutions deployed across 300+ organizations in the BeNeLux
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.coinSolutions.map((solution) => (
              <Link
                key={solution.title}
                href={solution.href}
                className="group bg-primary-900 hover:bg-primary-800 rounded-xl p-6 border border-primary-800 hover:border-primary-600 transition-all"
              >
                <h3 className="font-bold text-lg mb-2 group-hover:text-accent-400 transition-colors">
                  {solution.title}
                </h3>
                <p className="text-primary-300 text-sm leading-relaxed mb-3">
                  {solution.description}
                </p>
                <div className="flex items-center gap-2 text-accent-400 text-sm font-medium group-hover:gap-3 transition-all">
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {data.testimonial && (
        <section className="py-16 bg-warm-50">
          <div className="container-padding max-w-3xl mx-auto text-center">
            <blockquote className="text-xl text-slate-700 italic leading-relaxed mb-6">
              &ldquo;{data.testimonial.quote}&rdquo;
            </blockquote>
            <div>
              <p className="font-bold text-slate-900">{data.testimonial.author}</p>
              <p className="text-slate-500 text-sm">
                {data.testimonial.role} — {data.testimonial.company}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Related Services + CTA */}
      <section className="py-16 bg-accent-500 text-white">
        <div className="container-padding text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to strengthen your resilience?</h2>
          <p className="text-accent-100 mb-8 max-w-xl mx-auto">
            Talk to a COIN AS expert about your specific {data.title.toLowerCase()} challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-accent-600 font-semibold px-8 py-3 rounded-lg hover:bg-accent-50 transition-colors"
            >
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-accent-600 transition-colors"
            >
              All services
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
