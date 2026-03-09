import { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Become a Partner',
  description: 'Partner with COIN to deliver business continuity solutions across the BeNeLux region.',
}

export default function BecomePartnerPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
        <div className="relative container-padding max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Become a Partner</h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Join the COIN ecosystem and together let us help organizations strengthen their resilience.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-padding max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Why Partner */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Why partner with COIN?</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <h3 className="font-semibold mb-1">20+ years of expertise</h3>
                    <p className="text-gray-600 text-sm">Benefit from our deep experience in business continuity across the BeNeLux.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <h3 className="font-semibold mb-1">Established client network</h3>
                    <p className="text-gray-600 text-sm">Access our extensive network of enterprise clients seeking continuity solutions.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <h3 className="font-semibold mb-1">Complementary services</h3>
                    <p className="text-gray-600 text-sm">Combine your expertise with our consulting, training, and infrastructure services.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <h3 className="font-semibold mb-1">Joint market development</h3>
                    <p className="text-gray-600 text-sm">Collaborate on marketing, events, and business development initiatives.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Partnership Types */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Partnership types</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-2">Business Partner</h3>
                  <p className="text-gray-600 text-sm">
                    For organizations offering complementary consulting, training, or advisory services
                    in the business continuity and risk management space. Together we can offer
                    comprehensive solutions to our clients.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-2">Technology Partner</h3>
                  <p className="text-gray-600 text-sm">
                    For technology vendors and solution providers whose products enhance business
                    continuity, disaster recovery, or cyber resilience capabilities. Integrate your
                    technology into our service offerings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container-padding max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-6">
            Contact us to discuss how we can work together to deliver exceptional business continuity solutions.
          </p>
          <Link href="/contact" className="btn-primary inline-block">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
