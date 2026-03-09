import { getLocalizedField } from '@/lib/locale'
import { HeroSimpleSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Image from 'next/image'

interface HeroSimpleProps {
  section: HeroSimpleSection
  locale: Locale
}

export default function HeroSimple({ section, locale }: HeroSimpleProps) {
  const heading = getLocalizedField(section.heading, locale)
  const subtitle = getLocalizedField(section.subtitle, locale)

  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background: section.backgroundImageUrl
          ? undefined
          : 'linear-gradient(135deg, var(--color-secondary-800) 0%, var(--color-primary-900) 100%)',
      }}
    >
      {section.backgroundImageUrl && (
        <>
          <Image
            src={section.backgroundImageUrl}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-900/80 via-secondary-800/70 to-primary-900/80" />
        </>
      )}
      {!section.backgroundImageUrl && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-primary-400 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-primary-300 blur-3xl" />
        </div>
      )}
      <div className="container-padding relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{heading}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-primary-200 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
    </section>
  )
}
