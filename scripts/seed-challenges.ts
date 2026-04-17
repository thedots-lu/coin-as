import { config } from 'dotenv'
config({ path: '.env.local' })
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore'

type LocaleString = { en: string; fr: string; nl: string }
const ls = (en: string): LocaleString => ({ en, fr: '', nl: '' })

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const challenges = [
  {
    slug: 'banking-finance',
    order: 0,
    iconKey: 'Building2',
    title: ls('Banking & Finance'),
    subtitle: ls('Staying resilient under DORA, NIS2, CSSF & DNB requirements'),
    heroImage: '/images/coin/coin-fotosharonwillems-33.webp',
    intro: ls(
      'Financial institutions are among the most targeted organizations for cyber attacks and face the strictest regulatory requirements for operational resilience. COIN AS has been serving the financial sector for over 20 years.'
    ),
    context: ls(
      'The Digital Operational Resilience Act (DORA) and NIS2 directive have set new mandatory standards for financial institutions operating in the EU. Organizations must demonstrate that they can withstand, respond to, and recover from ICT-related disruptions, with documented, tested Business Continuity Plans and dedicated recovery infrastructure.'
    ),
    regulations: [
      { text: ls('DORA (Digital Operational Resilience Act): mandatory from January 2025') },
      { text: ls('NIS2 Directive: critical sector cyber resilience requirements') },
      { text: ls('CSSF (Luxembourg): operational resilience guidelines') },
      { text: ls('DNB (Netherlands): business continuity requirements for financial institutions') },
      { text: ls('NBB (Belgium): circular on operational risk management') },
    ],
    threats: [
      {
        title: ls('Ransomware & Cyber Attacks'),
        description: ls(
          'Financial institutions are prime targets. A successful attack can paralyze trading systems, lock client data, and trigger regulatory reporting obligations within hours.'
        ),
      },
      {
        title: ls('Physical Site Unavailability'),
        description: ls(
          'Flooding, fire, power blackout, or building access restriction can make your primary offices unusable. You need a tested alternative in minutes, not days.'
        ),
      },
      {
        title: ls('Telecom & IT Failure'),
        description: ls(
          'Dependency on cloud providers and telecom networks creates single points of failure. Redundant infrastructure and alternative connectivity are essential.'
        ),
      },
      {
        title: ls('Regulatory Non-Compliance'),
        description: ls(
          'Failure to demonstrate a tested BCP can result in supervisory action, fines, and reputational damage with clients and counterparties.'
        ),
      },
    ],
    coinSolutions: [
      {
        title: ls('Dedicated Recovery Workplaces'),
        description: ls(
          'Permanent, dedicated and fully equipped recovery seats at our Münsbach, Contern, Antwerp, and Amsterdam centers. Available 24/7, tested annually.'
        ),
        href: '/services/recovery-workplaces',
      },
      {
        title: ls('Business Continuity Consultancy'),
        description: ls(
          'Our senior experts help you build DORA-compliant BCPs, conduct BIA, define RTOs/RPOs, and run realistic disaster recovery exercises.'
        ),
        href: '/services/consultancy',
      },
      {
        title: ls('Cyber Resilience Solutions'),
        description: ls(
          'Secure COIN Keys, alternative Azure tenants, and immutable backup solutions to recover from ransomware without paying the ransom.'
        ),
        href: '/services/cyber-resilience',
      },
      {
        title: ls('Crisis Management Rooms'),
        description: ls(
          'Fully equipped, segregated crisis management facilities with redundant communications. Ready for your incident command team within hours.'
        ),
        href: '/services/business-continuity',
      },
    ],
    testimonial: {
      quote: ls(
        'COIN AS helped us achieve full DORA compliance and conduct our first cross-border disaster recovery exercise. The team understood our regulatory constraints and delivered exactly what we needed.'
      ),
      author: 'Thomas Van der Berg',
      role: ls('Chief Risk Officer'),
      company: 'BeNeLux Financial Group',
    },
    relatedServices: [
      { title: ls('Recovery Workplaces'), href: '/services/recovery-workplaces' },
      { title: ls('Consultancy & Training'), href: '/services/consultancy' },
      { title: ls('Cyber Resilience'), href: '/services/cyber-resilience' },
      { title: ls('Co-location Services'), href: '/services/co-location' },
    ],
  },
  {
    slug: 'insurance',
    order: 1,
    iconKey: 'Shield',
    title: ls('Insurance'),
    subtitle: ls('Operational resilience when claims surge and offices close'),
    heroImage: '/images/coin/coin-fotosharonwillems-58.webp',
    intro: ls(
      'Insurance companies face a unique paradox: the exact events that disrupt their operations (storms, floods, pandemics) are also when client demand peaks. COIN AS ensures your claims and underwriting teams keep running.'
    ),
    context: ls(
      'The insurance sector is increasingly regulated around operational resilience and data protection. With large claims-handling teams, distributed branch networks, and critical IT dependencies, insurers need tested and scalable business continuity solutions.'
    ),
    regulations: [
      { text: ls('Solvency II: operational risk and business continuity requirements') },
      { text: ls('DORA: for insurance groups with significant IT dependencies') },
      { text: ls('RGPD / GDPR: client data protection during incidents') },
      { text: ls('EIOPA: supervisory guidelines on business continuity') },
    ],
    threats: [
      {
        title: ls('Catastrophic Event Coincidence'),
        description: ls(
          'A major storm or flood disrupts your offices precisely when your claims teams need to be at full capacity. Your clients cannot wait.'
        ),
      },
      {
        title: ls('Ransomware on Policy Systems'),
        description: ls(
          'Core policy and claims management systems are high-value targets. Recovery time without tested backups can exceed weeks.'
        ),
      },
      {
        title: ls('Hybrid Workforce Gaps'),
        description: ls(
          'Remote working creates new vulnerabilities: compromised home devices, unsecured connections, and lack of crisis communication infrastructure.'
        ),
      },
    ],
    coinSolutions: [
      {
        title: ls('Shared Recovery Workplaces'),
        description: ls(
          'Rapidly deployable shared seats with customer-specific image deployment. Your claims team is operational within 2-4 hours of invocation.'
        ),
        href: '/services/recovery-workplaces',
      },
      {
        title: ls('Secure BYOD Solutions'),
        description: ls(
          'Secure COIN Keys allow your staff to work securely from any device (home, hotel, or COIN center) without compromising corporate security.'
        ),
        href: '/services/cyber-resilience',
      },
      {
        title: ls('Business Continuity Planning'),
        description: ls(
          'We help you define realistic disaster scenarios, map critical business processes, and build BCPs that pass regulatory scrutiny.'
        ),
        href: '/services/consultancy',
      },
    ],
    testimonial: null,
    relatedServices: [
      { title: ls('Shared Workplaces'), href: '/services/recovery-workplaces' },
      { title: ls('Cyber Resilience'), href: '/services/cyber-resilience' },
      { title: ls('BC Consultancy'), href: '/services/consultancy' },
    ],
  },
  {
    slug: 'utilities-energy',
    order: 2,
    iconKey: 'Zap',
    title: ls('Utilities & Energy'),
    subtitle: ls('Protecting critical infrastructure under NIS2'),
    heroImage: '/images/coin/co-location-area-munsbach.webp',
    intro: ls(
      "Energy grids, water networks, and utility operators are classified as critical infrastructure, making them prime targets for sophisticated cyber attacks and subject to the NIS2 directive's strictest requirements."
    ),
    context: ls(
      'The NIS2 Directive places utility companies among the "essential entities" subject to the highest level of security and resilience obligations. Organizations must implement robust incident response, business continuity planning, and supply chain security, with mandatory reporting within 24 hours of a significant incident.'
    ),
    regulations: [
      { text: ls('NIS2 Directive: mandatory for essential and important entities') },
      { text: ls('ENTSO-E / ENTSO-G: resilience requirements for energy operators') },
      { text: ls('National energy regulator requirements (CREG, ACM, ILR)') },
      { text: ls('RGPD: for smart grid and metering data') },
    ],
    threats: [
      {
        title: ls('State-Sponsored Cyber Attacks'),
        description: ls(
          'Utility networks are targeted by nation-state actors seeking to disrupt essential services. These attacks are sophisticated, persistent, and aimed at SCADA/OT systems.'
        ),
      },
      {
        title: ls('Physical Site Disruption'),
        description: ls(
          'Control rooms and operational centers must remain functional even when primary facilities are compromised by flooding, fire, or security incidents.'
        ),
      },
      {
        title: ls('Supply Chain Vulnerabilities'),
        description: ls(
          'Third-party IT and OT vendors create indirect attack surfaces. Business continuity must account for supplier failures.'
        ),
      },
    ],
    coinSolutions: [
      {
        title: ls('Dedicated Recovery Sites'),
        description: ls(
          'Secure, physically separate recovery facilities for your operational control teams, with redundant power, connectivity, and 24/7 access.'
        ),
        href: '/services/recovery-workplaces',
      },
      {
        title: ls('Crisis Management Facilities'),
        description: ls(
          'Purpose-built crisis management rooms with multi-channel communications for coordinating incident response across your operational network.'
        ),
        href: '/services/business-continuity',
      },
      {
        title: ls('NIS2 Compliance Consultancy'),
        description: ls(
          'Our consultants help you map NIS2 obligations to your operations, build compliant BCPs, and prepare for regulatory audits.'
        ),
        href: '/services/consultancy',
      },
    ],
    testimonial: null,
    relatedServices: [
      { title: ls('Dedicated Recovery Sites'), href: '/services/recovery-workplaces' },
      { title: ls('Crisis Management'), href: '/services/business-continuity' },
      { title: ls('NIS2 Consultancy'), href: '/services/nis2-dora' },
    ],
  },
  {
    slug: 'government-public',
    order: 3,
    iconKey: 'Landmark',
    title: ls('Government & Public Sector'),
    subtitle: ls('Continuity of essential public services and emergency management'),
    heroImage: '/images/coin/coin-fotosharonwillems-26.webp',
    intro: ls(
      'Public sector organizations, from tax authorities to emergency services, bear a duty to citizens that cannot be interrupted. COIN AS supports government agencies with the infrastructure and expertise to maintain essential services under any circumstances.'
    ),
    context: ls(
      'Government entities are increasingly targeted by ransomware and politically motivated attacks. Simultaneously, they face budget constraints and legacy IT environments. COIN AS provides pragmatic, cost-effective business continuity solutions designed for public sector realities.'
    ),
    regulations: [
      { text: ls('NIS2: public administration entities as essential entities') },
      { text: ls('National civil security and crisis management legislation') },
      { text: ls('RGPD: data protection for citizen data') },
      { text: ls('ISO 27001: information security management (COIN AS certified)') },
    ],
    threats: [
      {
        title: ls('Ransomware on Public IT'),
        description: ls(
          'Municipalities and public agencies have been hit by ransomware attacks that paralyzed citizen services for weeks. Recovery requires pre-positioned infrastructure.'
        ),
      },
      {
        title: ls('Natural Disasters & Civil Unrest'),
        description: ls(
          'Flooding, storms, and civil emergencies can make government buildings inaccessible precisely when agencies must remain operational.'
        ),
      },
      {
        title: ls('Legacy IT Dependencies'),
        description: ls(
          'Aging IT infrastructure increases vulnerability and complicates recovery. COIN AS helps bridge the gap with practical continuity solutions.'
        ),
      },
    ],
    coinSolutions: [
      {
        title: ls('Flexible Recovery Workplaces'),
        description: ls(
          'Short-term and flexible workspace contracts suited to public sector procurement cycles and budget constraints.'
        ),
        href: '/services/recovery-workplaces',
      },
      {
        title: ls('Secure Satellite Offices'),
        description: ls(
          'Permanent alternative office locations for distributed government teams, doubling as disaster recovery sites when needed.'
        ),
        href: '/services/satellite-offices',
      },
      {
        title: ls('Business Continuity Training'),
        description: ls(
          'Awareness sessions and exercises for public sector teams, building a culture of resilience from the frontline to leadership.'
        ),
        href: '/services/training',
      },
    ],
    testimonial: null,
    relatedServices: [
      { title: ls('Flexible Workplaces'), href: '/services/recovery-workplaces' },
      { title: ls('Satellite Offices'), href: '/services/satellite-offices' },
      { title: ls('Training'), href: '/services/training' },
      { title: ls('Consultancy'), href: '/services/consultancy' },
    ],
  },
]

async function seed() {
  console.log('Seeding challenges...')

  const snapshot = await getDocs(collection(db, 'challenges'))
  if (!snapshot.empty) {
    console.warn(
      `Challenges collection already contains ${snapshot.size} document(s). Aborting to avoid overwrites.`
    )
    console.warn('Delete the collection manually first if you want to re-seed.')
    return
  }

  const now = Timestamp.now()
  for (const c of challenges) {
    const payload = {
      ...c,
      published: true,
      createdAt: now,
      updatedAt: now,
    }
    await setDoc(doc(db, 'challenges', c.slug), payload)
    console.log(`  Wrote challenges/${c.slug}`)
  }

  console.log(`Seeded ${challenges.length} challenges.`)
}

seed()
  .then(() => {
    console.log('Done.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
