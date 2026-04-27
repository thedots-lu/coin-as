'use client'

import { getLocalizedField } from '@/lib/locale'
import { FlexibleServicesSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import { motion } from 'framer-motion'

interface FlexibleServicesProps {
  section: FlexibleServicesSection
  locale: Locale
  background?: string
  id?: string
}

const GAUGES = [
  {
    value: '99.9%',
    label: 'Uptime',
    progress: 0.999,
    color: 'var(--color-accent-500)',
  },
  {
    value: '24/7',
    label: 'Support',
    progress: 1,
    color: 'var(--color-primary-400)',
    showTicks: true,
  },
  {
    value: '<4h',
    label: 'Response',
    progress: 0.2,
    color: '#ffffff',
  },
]

function Gauge({
  value,
  label,
  progress,
  color,
  delay,
  showTicks,
}: {
  value: string
  label: string
  progress: number
  color: string
  delay: number
  showTicks?: boolean
}) {
  const radius = 38
  const strokeWidth = 7
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-square">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {showTicks && (
            <g stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180
                const x1 = 50 + Math.cos(angle) * 46
                const y1 = 50 + Math.sin(angle) * 46
                const x2 = 50 + Math.cos(angle) * 49
                const y2 = 50 + Math.sin(angle) * 49
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
              })}
            </g>
          )}
          <g transform="rotate(-90 50 50)">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={strokeWidth}
            />
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              whileInView={{ strokeDashoffset: circumference * (1 - progress) }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
            />
          </g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm md:text-lg lg:text-xl font-bold font-display text-white leading-none tracking-tight">
            {value}
          </span>
        </div>
      </div>
      <div className="mt-3 text-[10px] md:text-xs font-semibold text-white/60 uppercase tracking-[0.15em]">
        {label}
      </div>
    </div>
  )
}

export default function FlexibleServices({ section, locale, background = 'var(--color-warm-50)', id }: FlexibleServicesProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section id={id} className="relative py-28 md:py-36 overflow-hidden scroll-mt-24" style={{ background }}>
      {/* Precision dot grid -- evokes configurability and modular systems */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--color-secondary-600) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Floating geometric accents */}
      <motion.div
        initial={{ opacity: 0, rotate: -8 }}
        whileInView={{ opacity: 0.07, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute -top-20 -right-20 w-80 h-80 rounded-3xl border-2 pointer-events-none"
        style={{ borderColor: 'var(--color-secondary-300)' }}
      />
      <motion.div
        initial={{ opacity: 0, rotate: 8 }}
        whileInView={{ opacity: 0.05, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-3xl border-2 pointer-events-none"
        style={{ borderColor: 'var(--color-primary-300)' }}
      />

      <div className="container-padding relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Reversed layout: image left, text right */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-20">
            {/* Text column */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-1/2"
            >
              {/* Horizontal tag-style label with pill shape */}
              <div className="mb-8 flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.15em] uppercase font-display"
                  style={{
                    background: 'var(--color-secondary-100)',
                    color: 'var(--color-secondary-700)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--color-accent-500)' }}
                  />
                  Tailored SLA
                </span>
                <div
                  className="h-px flex-grow max-w-24"
                  style={{ background: 'linear-gradient(90deg, var(--color-secondary-200), transparent)' }}
                />
              </div>

              {heading && (
                <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-secondary-800 mb-8 leading-[1.15] tracking-tight">
                  {heading}
                </h2>
              )}

              {body && (
                <p className="text-secondary-500 leading-relaxed text-lg max-w-lg">{body}</p>
              )}
            </motion.div>

            {/* Chart column -- SLA dashboard visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: -30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-1/2 w-full"
            >
              <div className="relative group">
                <div
                  className="absolute inset-3 rounded-xl border-2 pointer-events-none z-20 transition-all duration-700 group-hover:inset-4"
                  style={{ borderColor: 'rgba(255,255,255,0.18)' }}
                />
                <div
                  className="relative rounded-2xl overflow-hidden shadow-xl"
                  role="img"
                  aria-label="Service level dashboard: 99.9% uptime, 24/7 support, less than 4 hours response time"
                >
                  <div
                    className="aspect-[4/3] relative"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 55%, var(--color-primary-950) 100%)',
                    }}
                  >
                    {/* Soft grid background */}
                    <div
                      className="absolute inset-0 opacity-[0.07]"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                      }}
                    />
                    {/* Ambient accent glow */}
                    <div
                      className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-30"
                      style={{ background: 'var(--color-accent-500)' }}
                    />

                    <div className="relative h-full flex flex-col px-6 md:px-10 py-7 md:py-9">
                      {/* Header tag */}
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--color-accent-500)' }}
                        />
                        <span className="text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-white/70 font-display">
                          Service Level
                        </span>
                        <div className="h-px flex-grow max-w-[40%] bg-gradient-to-r from-white/20 to-transparent" />
                      </div>

                      {/* Gauges */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-4 md:gap-6 w-full max-w-[360px]">
                          {GAUGES.map((g, i) => (
                            <Gauge
                              key={g.label}
                              value={g.value}
                              label={g.label}
                              progress={g.progress}
                              color={g.color}
                              showTicks={g.showTicks}
                              delay={0.25 + i * 0.15}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Footer caption */}
                      <div className="text-[10px] md:text-xs text-white/50 tracking-wider uppercase font-display">
                        Tailored to your business continuity needs
                      </div>
                    </div>

                    {/* Bottom accent bar */}
                    <div className="absolute bottom-0 left-0 right-0 flex h-1">
                      <div className="flex-1" style={{ background: 'var(--color-secondary-500)' }} />
                      <div className="w-1" />
                      <div className="flex-1" style={{ background: 'var(--color-primary-500)' }} />
                      <div className="w-1" />
                      <div className="flex-1" style={{ background: 'var(--color-accent-500)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
