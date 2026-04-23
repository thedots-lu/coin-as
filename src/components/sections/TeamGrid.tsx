'use client'

import { getLocalizedField } from '@/lib/locale'
import { TeamsSection } from '@/lib/types/page'
import { TeamMember } from '@/lib/types/team'
import { Locale } from '@/lib/types/locale'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface TeamGridProps {
  section: TeamsSection
  locale: Locale
  teamMembers: TeamMember[]
}

export default function TeamGrid({ section, locale, teamMembers }: TeamGridProps) {
  const heading = getLocalizedField(section.heading, locale)
  const body = getLocalizedField(section.body, locale)

  return (
    <section id="teams" className="py-20 bg-warm-100/60 scroll-mt-24">
      <div className="container-padding">
        {heading && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">{heading}</h2>
          </AnimatedSection>
        )}

        {body && (
          <AnimatedSection animation="slideUp" className="text-center mb-16">
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">{body}</p>
          </AnimatedSection>
        )}

        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => {
              const name = getLocalizedField(member.name, locale)
              const position = getLocalizedField(member.position, locale)
              const bio = getLocalizedField(member.bio, locale)

              return (
                <AnimatedSection
                  key={member.id}
                  animation="slideUp"
                  delay={index * 0.1}
                >
                  <div className="glass-card p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    {member.photoUrl && (
                      <div className="mb-4 flex justify-center">
                        <img
                          src={member.photoUrl}
                          alt={name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-center mb-1">
                      {name}
                    </h3>
                    {position && (
                      <p className="text-primary-600 text-center text-sm font-medium mb-3">
                        {position}
                      </p>
                    )}
                    {bio && (
                      <p className="text-secondary-600 text-sm leading-relaxed flex-grow">
                        {bio}
                      </p>
                    )}
                    {member.linkedinUrl && (
                      <div className="mt-4 text-center">
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-secondary-500">No team members to display.</p>
        )}
      </div>
    </section>
  )
}
