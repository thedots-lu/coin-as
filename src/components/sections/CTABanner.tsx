'use client'

import { getLocalizedField } from '@/lib/locale'
import { CTABannerSection } from '@/lib/types/page'
import { Locale } from '@/lib/types/locale'
import Button from '@/components/ui/Button'
import DecryptedText from '@/components/reactbits/DecryptedText'

interface CTABannerProps {
  section: CTABannerSection
  locale: Locale
}

export default function CTABanner({ section, locale }: CTABannerProps) {
  const heading = getLocalizedField(section.heading, locale)
  const buttonText = getLocalizedField(section.buttonText, locale)

  return (
    <section
      className="py-20 animate-gradient"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-secondary-600) 50%, var(--color-primary-600) 100%)',
        backgroundSize: '200% 200%',
      }}
    >
      <div className="container-padding text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          <DecryptedText
            text={heading || ''}
            animateOn="view"
            speed={30}
            maxIterations={15}
            sequential
            revealDirection="center"
            className="text-white"
            encryptedClassName="text-white/40"
          />
        </h2>
        {buttonText && (
          <Button
            href={section.buttonLink}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-4"
          >
            {buttonText}
          </Button>
        )}
      </div>
    </section>
  )
}
