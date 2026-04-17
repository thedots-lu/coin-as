import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, Building2, Shield, Zap, Landmark, Briefcase } from 'lucide-react'
import { getPublishedChallenges } from '@/lib/firestore/challenges'

export const metadata: Metadata = {
  title: 'Business Continuity Challenges',
  description:
    'Every sector faces unique business continuity challenges. Discover how COIN AS helps Banking, Insurance, Utilities, and Government organizations stay resilient.',
  alternates: { canonical: 'https://coin-bc.com/challenges' },
  openGraph: {
    title: 'Business Continuity Challenges by Sector | COIN AS',
    description:
      'Every sector faces unique business continuity challenges. Discover how COIN AS helps Banking, Insurance, Utilities, and Government organizations stay resilient.',
    url: 'https://coin-bc.com/challenges',
  },
}

const iconMap: Record<string, typeof Building2> = {
  Building2,
  Shield,
  Zap,
  Landmark,
  Briefcase,
}

export default async function ChallengesPage() {
  const sectors = await getPublishedChallenges()

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden text-white py-24">
        <Image
          src="/images/coin/coin-fotosharonwillems-36.webp"
          alt="COIN AS team discussing ransomware attack response strategy"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/90 via-primary-900/80 to-primary-800/70" />
        <div className="container-padding relative z-10 text-center">
          <p className="text-accent-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Sector Expertise
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Business Continuity Challenges
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Every sector faces unique threats and regulatory requirements. Discover how COIN AS
            helps your industry stay resilient when it matters most.
          </p>
        </div>
      </section>

      {/* Sectors grid */}
      <section className="py-20 bg-warm-50">
        <div className="container-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sectors.map((sector) => {
              const Icon = (sector.iconKey && iconMap[sector.iconKey]) || Briefcase
              const title = sector.title?.en || ''
              const subtitle = sector.subtitle?.en || ''
              const description = sector.intro?.en || ''
              const bullets = (sector.threats ?? []).slice(0, 4).map((t) => t?.title?.en || '').filter(Boolean)
              return (
                <Link
                  key={sector.slug}
                  href={`/challenges/${sector.slug}`}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    {sector.heroImage && (
                      <Image
                        src={sector.heroImage}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                      <Icon className="h-5 w-5 text-accent-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-accent-300">
                        {subtitle}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-primary-500 transition-colors">
                      {title}
                    </h2>
                    <p className="text-slate-600 mb-4 leading-relaxed">{description}</p>
                    {bullets.length > 0 && (
                      <ul className="space-y-1 mb-5">
                        {bullets.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-sm text-slate-500">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center gap-2 text-primary-500 font-semibold text-sm group-hover:gap-3 transition-all">
                      Discover our solutions
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-500 text-white">
        <div className="container-padding text-center">
          <h2 className="text-3xl font-bold mb-4">Don&apos;t see your sector?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            COIN AS serves organizations across all critical industries. Contact us to discuss your
            specific business continuity challenges.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-primary-500 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Talk to an expert
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
