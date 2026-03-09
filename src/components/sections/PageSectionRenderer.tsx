import { PageSection } from '@/lib/types/page'
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
import TestimonialsCarousel from '@/components/sections/TestimonialsCarousel'
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

interface PageSectionRendererProps {
  sections: PageSection[]
  locale?: Locale
  testimonials?: Testimonial[]
  teamMembers?: TeamMember[]
  partners?: Partner[]
}

export default function PageSectionRenderer({
  sections,
  locale = 'en',
  testimonials,
  teamMembers = [],
  partners = [],
}: PageSectionRendererProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  return (
    <>
      {sorted.map((section, index) => {
        const key = `${section.type}-${index}`

        switch (section.type) {
          case 'hero':
            return <HeroSection key={key} section={section} locale={locale} />
          case 'hero_simple':
            return <HeroSimple key={key} section={section} locale={locale} />
          case 'service_pillars':
            return <ServicePillars key={key} section={section} locale={locale} />
          case 'stats':
            return <StatsCounter key={key} section={section} locale={locale} />
          case 'timeline':
            return <Timeline key={key} section={section} locale={locale} />
          case 'cta_banner':
            return <CTABanner key={key} section={section} locale={locale} />
          case 'contact_form':
            return <ContactForm key={key} section={section} locale={locale} />
          case 'contact_info':
            return <ContactInfo key={key} section={section} locale={locale} />
          case 'rich_text':
            return <RichTextBlock key={key} section={section} locale={locale} />
          case 'features_list':
            return <FeaturesSection key={key} section={section} locale={locale} />
          case 'process_pipeline':
            return <ProcessPipeline key={key} section={section} locale={locale} />
          case 'room_types':
            return <RoomTypes key={key} section={section} locale={locale} />
          case 'site_gallery':
            return <SiteGallery key={key} section={section} locale={locale} />
          case 'testimonials_ref':
            if (testimonials && testimonials.length > 0) {
              return (
                <TestimonialsCarousel
                  key={key}
                  testimonials={testimonials}
                  heading={section.heading}
                  locale={locale}
                />
              )
            }
            return null
          case 'teams':
            return <TeamGrid key={key} section={section} locale={locale} teamMembers={teamMembers} />
          case 'partners_preview':
            return <PartnersPreview key={key} section={section} locale={locale} partners={partners} />
          case 'customers':
            return <CustomersSection key={key} section={section} locale={locale} />
          case 'values':
            return <ValuesGrid key={key} section={section} locale={locale} />
          case 'mission':
            return <MissionDiagram key={key} section={section} locale={locale} />
          case 'map_overview':
            return <MapOverview key={key} section={section} locale={locale} />
          case 'innovation':
            return <InnovationBlock key={key} section={section} locale={locale} />
          case 'flexible_services':
            return <FlexibleServices key={key} section={section} locale={locale} />
          case 'mission_statement':
            return <MissionStatement key={key} section={section} locale={locale} />
          case 'benefits':
            return <BenefitsSection key={key} section={section} locale={locale} />
          case 'business_case':
            return <BusinessCase key={key} section={section} locale={locale} />
          default:
            return null
        }
      })}
    </>
  )
}
