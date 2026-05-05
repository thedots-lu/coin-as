import { config } from 'dotenv'
config({ path: '.env.local' })
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { LocaleString } from '../src/lib/types/locale'
import {
  FeaturesListSection,
  LifecycleDiagramSection,
  ServicesGridSection,
  CTABannerSection,
  PageSection,
} from '../src/lib/types/page'

const ls = (en: string): LocaleString => ({ en, fr: '', nl: '' })

function loadServiceAccount() {
  const p = path.join(process.cwd(), '.firebase-target-sa.json')
  const j = JSON.parse(readFileSync(p, 'utf-8')) as {
    project_id: string
    client_email: string
    private_key: string
  }
  return { projectId: j.project_id, clientEmail: j.client_email, privateKey: j.private_key }
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(loadServiceAccount()) })
}
const db = getFirestore()

const introSection: FeaturesListSection = {
  type: 'features_list',
  order: 0,
  heading: ls(
    'Advisory Services and Solutions that enable organisations to achieve their business continuity objectives',
  ),
  features: [
    {
      title: ls(
        'Tested continuity plans and solutions to prevent and respond to crisis and business disruptions 24x7',
      ),
      description: ls(''),
      icon: 'ShieldCheck',
    },
    {
      title: ls(
        'Regulatory compliance with local business continuity laws and resilience frameworks such as NIS2 and DORA',
      ),
      description: ls(''),
      icon: 'ScrollText',
    },
    {
      title: ls(
        'Cost-effective and flexible contracts for alternative facilities, IT infrastructure and disaster recovery services',
      ),
      description: ls(''),
      icon: 'Wallet',
    },
  ],
}

const lifecycleSection: LifecycleDiagramSection = {
  type: 'lifecycle_diagram',
  order: 1,
  heading: ls('Our approach to business continuity'),
  body: ls(
    'COIN unique core business is to provide continuity solutions and services that span the full business continuity lifecycle:',
  ),
  steps: [
    {
      title: ls('Assess'),
      tagline: ls('Understand your risks and possible disruption scenarios'),
      description: ls('Perform Business Impact Analysis.'),
    },
    {
      title: ls('Prevent'),
      tagline: ls('Reduce your risks and strengthen your resilience'),
      description: ls('Improve your technical resiliency and redundancy and prevent phishing.'),
    },
    {
      title: ls('Prepare'),
      tagline: ls('Get your teams ready to address crisis and disasters'),
      description: ls(
        'Design Business Continuity Plan, perform training, simulations and exercises.',
      ),
    },
    {
      title: ls('Respond'),
      tagline: ls('Ensure the continuity of your operations when disruption occurs'),
      description: ls(
        'Provide Recovery offices, alternate IT infrastructure and crisis management facilities.',
      ),
    },
    {
      title: ls('Recover'),
      tagline: ls('Support your organisation to get back to business as usual'),
      description: ls(
        'Flexible solution for recovery, project management and logistics to rebuild operations.',
      ),
    },
    {
      title: ls('Improve'),
      tagline: ls('Avoid reoccurrence of disrupting events and limit impact'),
      description: ls(
        'Review and improve business continuity plans and adjust prevention and training schemes.',
      ),
    },
  ],
}

const servicesGridSection: ServicesGridSection = {
  type: 'services_grid',
  order: 2,
  heading: ls('Our services designed for resilience'),
}

const ctaSection: CTABannerSection = {
  type: 'cta_banner',
  order: 3,
  heading: ls('Not sure where to start?'),
  body: ls(
    'Our team will assess your current resilience posture and recommend the right combination of services for your organisation.',
  ),
  buttonText: ls('Get in touch'),
  buttonLink: '/contact',
  theme: 'dark',
}

const sections: PageSection[] = [introSection, lifecycleSection, servicesGridSection, ctaSection]

async function migrate() {
  const ref = db.collection('services').doc('overview')
  const snap = await ref.get()
  const now = Timestamp.now()

  if (!snap.exists) {
    await ref.set({
      slug: 'overview',
      title: ls('Our Services'),
      shortTitle: ls('Overview'),
      category: 'consulting',
      order: 0,
      seo: {
        metaTitle: ls('Services | COIN AS'),
        metaDescription: ls(
          'COIN business continuity services: consultancy & training, recovery workplaces, crisis management, IT housing, cyber resilience.',
        ),
        ogImage: null,
      },
      heroSubtitle: ls(''),
      heroImageUrl: null,
      overview: ls(''),
      sections,
      published: true,
      createdAt: now,
      updatedAt: now,
    })
    console.log('Created services/overview with 4 sections.')
    return
  }

  await ref.update({
    title: ls('Our Services'),
    sections,
    published: true,
    updatedAt: now,
  })
  console.log('Updated services/overview with 4 sections.')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
