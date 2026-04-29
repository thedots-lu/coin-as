'use client'

import { motion } from 'framer-motion'
import { getLocalizedField } from '@/lib/locale'
import { StatsSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import CountUp from '@/components/reactbits/CountUp'

interface StatsCounterProps {
  section: StatsSection
  locale: Locale
}

export default function StatsCounter({ section, locale }: StatsCounterProps) {
  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--color-surface-dark)' }}>
      {/* Architectural grid lines -- subtle depth */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal rule at top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }}
        />
        {/* Vertical dividers between stats */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 hidden md:block"
            style={{
              left: `${i * 25}%`,
              width: '1px',
              background: 'linear-gradient(to bottom, transparent 10%, rgba(255,255,255,0.04) 50%, transparent 90%)',
            }}
          />
        ))}
        {/* Ambient glow -- top left */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(14,158,239,0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="container-padding relative">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {section.stats.map((stat, index) => {
            const label = getLocalizedField(stat.label, locale)
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative py-16 md:py-24 px-4 md:px-8"
              >
                {/* Hover accent bar */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-12 transition-all duration-500 ease-out"
                  style={{ background: 'var(--color-accent-400)' }}
                />

                {/* The number -- oversized, authoritative */}
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className="font-display tabular-nums tracking-tighter leading-none"
                    style={{
                      fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    <CountUp
                      to={stat.value}
                      from={0}
                      duration={2.8}
                      delay={index * 0.15}
                      separator=""
                      className="tabular-nums"
                    />
                  </span>
                  {stat.suffix && (
                    <span
                      className="font-display tracking-tight leading-none"
                      style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                        fontWeight: 600,
                        color: 'var(--color-accent-400)',
                      }}
                    >
                      {stat.suffix}
                    </span>
                  )}
                </div>

                {/* Label -- precise, restrained */}
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.12 }}
                  className="mt-3 text-sm md:text-base tracking-wide uppercase text-center"
                  style={{
                    color: 'var(--color-secondary-400)',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                  }}
                >
                  {label}
                </motion.p>

                {/* Mobile bottom border */}
                <div
                  className="absolute bottom-0 left-4 right-4 h-px md:hidden"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bottom rule */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }}
      />
    </section>
  )
}
