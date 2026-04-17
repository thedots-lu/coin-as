import { Metadata } from 'next'
import FAQAccordion from '@/components/sections/FAQAccordion'
import HubBanner from '@/components/knowledge-hub/HubBanner'
import { getPublishedFaqItems } from '@/lib/firestore/faq'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about business continuity, NIS2, DORA, and COIN services.',
  alternates: { canonical: 'https://coin-bc.com/knowledge-hub/faq' },
  openGraph: {
    title: 'FAQ - Business Continuity & COIN Services | COIN AS',
    description: 'Frequently asked questions about business continuity, NIS2, DORA, and COIN services.',
    url: 'https://coin-bc.com/knowledge-hub/faq',
  },
}

export default async function FAQPage() {
  const items = await getPublishedFaqItems()

  return (
    <>
      <HubBanner title="Frequently Asked Questions" backToHub />

      {items.length === 0 ? (
        <section className="py-20">
          <div className="container-padding max-w-3xl mx-auto text-center">
            <p className="text-secondary-600">No FAQ items available at the moment.</p>
          </div>
        </section>
      ) : (
        <FAQAccordion
          items={items.map((it) => ({ question: it.question, answer: it.answer }))}
          locale="en"
        />
      )}

      {/* CTA */}
      <section className="py-16 bg-warm-50">
        <div className="container-padding max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-primary-900 font-display">Still have questions?</h2>
          <p className="text-secondary-600 mb-6">
            Our team of experts is ready to help you with your business continuity needs.
          </p>
          <a
            href="/contact"
            className="btn-primary inline-block"
          >
            Contact Us
          </a>
        </div>
      </section>
    </>
  )
}
