import { Fragment, ReactNode } from 'react'
import { PageSection, isSectionVisible } from '@/lib/types/page'
import { Testimonial } from '@/lib/types/testimonial'
import { Locale } from '@/lib/types/locale'
import { TeamMember } from '@/lib/types/team'
import { Partner } from '@/lib/types/partner'
import HeroSection from '@/components/sections/HeroSection'
import HeroSimple from '@/components/sections/HeroSimple'
import ServicePillars from '@/components/sections/ServicePillars'
import StatsCounter from '@/components/sections/StatsCounter'
import Timeline from '@/components/sections/Timeline'
import CTABanner from '@/components/sections/CTABanner'
import ContactForm from '@/components/sections/ContactForm'
import ContactInfo from '@/components/sections/ContactInfo'
import RichTextBlock from '@/components/sections/RichTextBlock'
import FeaturesSection from '@/components/sections/FeaturesSection'
import ProcessPipeline from '@/components/sections/ProcessPipeline'
import RoomTypes from '@/components/sections/RoomTypes'
import SiteGallery from '@/components/sections/SiteGallery'
import TeamGrid from '@/components/sections/TeamGrid'
import PartnersPreview from '@/components/sections/PartnersPreview'
import CustomersSection from '@/components/sections/CustomersSection'
import MissionDiagram from '@/components/sections/MissionDiagram'
import MapOverview from '@/components/sections/MapOverview'
import InnovationBlock from '@/components/sections/InnovationBlock'
import FlexibleServices from '@/components/sections/FlexibleServices'
import MissionStatement from '@/components/sections/MissionStatement'
import ValuesGrid from '@/components/sections/ValuesGrid'
import BenefitsSection from '@/components/sections/BenefitsSection'
import BusinessCase from '@/components/sections/BusinessCase'
import TrustedByMarquee from '@/components/sections/TrustedByMarquee'
import SectionEditOverlay from '@/components/admin/cms/SectionEditOverlay'

interface PageSectionRendererProps {
  sections: PageSection[]
  locale?: Locale
  testimonials?: Testimonial[]
  teamMembers?: TeamMember[]
  partners?: Partner[]
  customerLogos?: Array<{ url: string; name: string }>
  /** When true, each section is wrapped in a CMS edit overlay (admin only). */
  withSectionOverlay?: boolean
}

export default function PageSectionRenderer({
  sections,
  locale = 'en',
  testimonials,
  teamMembers = [],
  partners = [],
  customerLogos,
  withSectionOverlay = false,
}: PageSectionRendererProps) {
  // Sort while preserving each section's index in the original Firestore array,
  // so CMS edit paths address the actual stored slot regardless of render order.
  const indexed = sections.map((section, originalIndex) => ({ section, originalIndex }))
  const sorted = [...indexed].sort((a, b) => a.section.order - b.section.order)

  function renderSection(section: PageSection, originalIndex: number): ReactNode {
    const basePath = `sections.${originalIndex}`
    switch (section.type) {
      case 'hero':
        return <HeroSection section={section} locale={locale} basePath={basePath} />
      case 'hero_simple':
        return <HeroSimple section={section} locale={locale} />
      case 'service_pillars':
        return <ServicePillars section={section} locale={locale} />
      case 'stats':
        return <StatsCounter section={section} locale={locale} basePath={basePath} />
      case 'timeline':
        return <Timeline section={section} locale={locale} />
      case 'cta_banner':
        return <CTABanner section={section} locale={locale} basePath={basePath} />
      case 'contact_form':
        return <ContactForm section={section} locale={locale} />
      case 'contact_info':
        return <ContactInfo section={section} locale={locale} />
      case 'rich_text':
        return <RichTextBlock section={section} locale={locale} />
      case 'features_list':
        return <FeaturesSection section={section} locale={locale} />
      case 'process_pipeline':
        return <ProcessPipeline section={section} locale={locale} />
      case 'room_types':
        return <RoomTypes section={section} locale={locale} />
      case 'site_gallery':
        return <SiteGallery section={section} locale={locale} />
      // Hidden for now
      // case 'testimonials_ref':
      //   if (testimonials && testimonials.length > 0) {
      //     return (
      //       <TestimonialsCarousel
      //         testimonials={testimonials}
      //         heading={section.heading}
      //         locale={locale}
      //       />
      //     )
      //   }
      //   return null
      case 'teams':
        return <TeamGrid section={section} locale={locale} teamMembers={teamMembers} />
      case 'partners_preview':
        return <PartnersPreview section={section} locale={locale} partners={partners} />
      case 'customers':
        return <CustomersSection section={section} locale={locale} />
      case 'values':
        return <ValuesGrid section={section} locale={locale} />
      case 'mission':
        return <MissionDiagram section={section} locale={locale} />
      case 'map_overview':
        return <MapOverview section={section} locale={locale} />
      case 'innovation':
        return <InnovationBlock section={section} locale={locale} basePath={basePath} />
      case 'flexible_services':
        return <FlexibleServices section={section} locale={locale} basePath={basePath} />
      case 'mission_statement':
        return (
          <>
            <MissionStatement section={section} locale={locale} basePath={basePath} />
            <TrustedByMarquee logos={customerLogos} />
          </>
        )
      case 'benefits':
        return <BenefitsSection section={section} locale={locale} />
      case 'business_case':
        return <BusinessCase section={section} locale={locale} />
      // Hidden for now — hero carousel replaces this
      // case 'featured_carousel':
      //   return <FeaturedCarousel section={section} locale={locale} />
      default:
        return null
    }
  }

  return (
    <>
      {sorted.map(({ section, originalIndex }) => {
        const key = `${section.type}-${originalIndex}`
        const visible = isSectionVisible(section)
        // Public site: skip hidden sections entirely.
        if (!withSectionOverlay && !visible) return null
        const node = renderSection(section, originalIndex)
        if (node === null) return null
        if (!withSectionOverlay) return <Fragment key={key}>{node}</Fragment>
        return (
          <SectionEditOverlay
            key={key}
            originalIndex={originalIndex}
            type={section.type}
            visible={visible}
          >
            {node}
          </SectionEditOverlay>
        )
      })}
    </>
  )
}
