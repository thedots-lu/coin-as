import { getPublishedServices } from '@/lib/firestore/services'
import { getLocalizedField } from '@/lib/locale'
import Link from 'next/link'
import { Metadata } from 'next'
import Image from 'next/image'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Services',
  description:
    'COIN business continuity services: consulting, training, recovery workplaces, and cyberresilience solutions.',
}

export default async function ServicesPage() {
  const services = await getPublishedServices()

  const consulting = services.filter((s) => s.category === 'consulting')
  const centers = services.filter((s) => s.category === 'centers')
  const cyber = services.filter((s) => s.category === 'cyber')

  const categories = [
    { title: 'Consulting & Training', items: consulting },
    { title: 'Business Continuity Centres', items: centers },
    { title: 'Cyberresilience Solutions', items: cyber },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden text-white py-20">
        <Image
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-900/80 via-secondary-800/70 to-primary-900/80" />
        <div className="container-padding text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Comprehensive business continuity solutions for the BeNeLux
          </p>
        </div>
      </section>

      {/* Service categories */}
      {categories.map((cat) => (
        <section key={cat.title} className="py-16">
          <div className="container-padding">
            <h2 className="text-3xl font-bold mb-8">{cat.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cat.items
                .filter((s) => s.slug !== 'overview')
                .map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 h-full border border-gray-100 hover:-translate-y-1">
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-500 transition-colors">
                        {getLocalizedField(service.title, 'en')}
                      </h3>
                      <p className="text-gray-600">
                        {getLocalizedField(service.overview, 'en')}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
