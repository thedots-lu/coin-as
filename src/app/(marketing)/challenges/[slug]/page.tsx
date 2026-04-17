import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { getChallengeBySlug, getPublishedChallenges } from '@/lib/firestore/challenges'

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  const challenges = await getPublishedChallenges()
  return challenges.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getChallengeBySlug(slug)
  if (!data) return {}
  const title = data.title?.en || ''
  const intro = data.intro?.en || ''
  return {
    title: `${title} | Business Continuity Challenges`,
    description: intro,
  }
}

export default async function ChallengePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const data = await getChallengeBySlug(slug)
  if (!data) notFound()

  const title = data.title?.en || ''
  const subtitle = data.subtitle?.en || ''
  const intro = data.intro?.en || ''
  const context = data.context?.en || ''

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden text-white py-28 md:py-36">
        {data.heroImage && (
          <Image src={data.heroImage} alt={title} fill className="object-cover" priority />
        )}
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
          <p className="text-xl text-primary-100 max-w-2xl">{subtitle}</p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16">
        <div className="container-padding max-w-4xl">
          <p className="text-xl text-slate-600 leading-relaxed">{intro}</p>
        </div>
      </section>

      {/* Context & Regulations */}
      <section className="py-16 bg-primary-50">
        <div className="container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">The Regulatory Context</h2>
              <p className="text-slate-600 leading-relaxed mb-6">{context}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-primary-500">Key Regulations</h3>
              <ul className="space-y-3">
                {(data.regulations ?? []).map((reg, idx) => {
                  const text = reg?.text?.en || ''
                  return (
                    <li key={`${idx}-${text}`} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm">{text}</span>
                    </li>
                  )
                })}
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
            {(data.threats ?? []).map((threat, idx) => {
              const t = threat?.title?.en || ''
              const d = threat?.description?.en || ''
              return (
                <div key={`${idx}-${t}`} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-coin-red-50 flex items-center justify-center mb-4">
                    <span className="w-3 h-3 rounded-full bg-coin-red-500" />
                  </div>
                  <h3 className="font-bold mb-2 text-lg">{t}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{d}</p>
                </div>
              )
            })}
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
            {(data.coinSolutions ?? []).map((solution, idx) => {
              const t = solution?.title?.en || ''
              const d = solution?.description?.en || ''
              return (
                <Link
                  key={`${idx}-${t}`}
                  href={solution.href}
                  className="group bg-primary-900 hover:bg-primary-800 rounded-xl p-6 border border-primary-800 hover:border-primary-600 transition-all"
                >
                  <h3 className="font-bold text-lg mb-2 group-hover:text-accent-400 transition-colors">
                    {t}
                  </h3>
                  <p className="text-primary-300 text-sm leading-relaxed mb-3">{d}</p>
                  <div className="flex items-center gap-2 text-accent-400 text-sm font-medium group-hover:gap-3 transition-all">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {data.testimonial && (
        <section className="py-16 bg-warm-50">
          <div className="container-padding max-w-3xl mx-auto text-center">
            <blockquote className="text-xl text-slate-700 italic leading-relaxed mb-6">
              &ldquo;{data.testimonial.quote?.en || ''}&rdquo;
            </blockquote>
            <div>
              <p className="font-bold text-slate-900">{data.testimonial.author}</p>
              <p className="text-slate-500 text-sm">
                {data.testimonial.role?.en || ''}, {data.testimonial.company}
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
            Talk to a COIN AS expert about your specific {title.toLowerCase()} challenges.
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
