'use client'

/**
 * Compact logo marquee — "Trusted by" strip for the landing page.
 * Sits below MissionStatement. Pure CSS animation, no heavy deps.
 */

const LOGOS = [
  '/images/customers/generali.jpg',
  '/images/customers/robeco.jpg',
  '/images/customers/frieslandcampina.png',
  '/images/customers/gemeente-amsterdam.jpg',
  '/images/customers/bat.jpg',
  '/images/customers/credit-europe.jpg',
  '/images/customers/crocs.jpg',
  '/images/customers/howden.jpg',
  '/images/customers/mediq.png',
  '/images/customers/intrum.png',
  '/images/customers/bkr.jpg',
  '/images/customers/cak.jpg',
  '/images/customers/aac.jpg',
  '/images/customers/ems.png',
  '/images/customers/erasmus-leven.jpg',
  '/images/customers/fca-capital.jpg',
  '/images/customers/harmony.jpg',
  '/images/customers/infomedics.jpg',
  '/images/customers/tentoo.jpg',
]

export default function TrustedByMarquee() {
  // Triple the logos for seamless loop
  const tripled = [...LOGOS, ...LOGOS, ...LOGOS]

  return (
    <section className="py-10 bg-white overflow-hidden">
      <div className="container-padding mb-10 text-center">
        <div className="w-12 h-1 bg-accent-500 rounded-full mx-auto mb-5" />
        <h2 className="text-2xl md:text-3xl font-bold text-secondary-800 font-display">
          Trusted by leading organisations across the BeNeLux
        </h2>
      </div>

      {/* Marquee container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden">
          <div
            className="flex items-center gap-16 animate-marquee"
            style={{
              width: 'max-content',
            }}
          >
            {tripled.map((url, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center justify-center w-[280px] h-[120px]"
              >
                <img
                  src={url}
                  alt=""
                  className="max-h-[110px] max-w-[250px] object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
