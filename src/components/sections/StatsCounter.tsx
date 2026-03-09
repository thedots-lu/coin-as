'use client'

import { getLocalizedField } from '@/lib/locale'
import { StatsSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import GlassCard from '@/components/ui/GlassCard'
import CountUp from '@/components/reactbits/CountUp'

interface StatsCounterProps {
  section: StatsSection
  locale: Locale
}

export default function StatsCounter({ section, locale }: StatsCounterProps) {
  return (
    <section
      className="py-20"
      style={{
        background: 'linear-gradient(135deg, var(--color-secondary-800) 0%, var(--color-secondary-900) 100%)',
      }}
    >
      <div className="container-padding">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {section.stats.map((stat, index) => (
            <GlassCard key={index} className="p-6 text-center" shineEffect>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                <CountUp
                  to={stat.value}
                  from={0}
                  duration={2.5}
                  delay={index * 0.15}
                  separator=""
                  className="tabular-nums"
                />
                {stat.suffix && <span>{stat.suffix}</span>}
              </div>
              <p className="text-primary-200 text-sm md:text-base">
                {getLocalizedField(stat.label, locale)}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
