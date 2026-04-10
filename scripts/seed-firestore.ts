import { config } from 'dotenv';
config({ path: '.env.local' });
import { initializeApp } from 'firebase/app';
import {
  getFirestore as getFs,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type LocaleString = { en: string; fr: string; nl: string };
const ls = (en: string): LocaleString => ({ en, fr: '', nl: '' });

function getFirestore(): Firestore {
  const app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  });
  return getFs(app);
}

const ts = () => ({
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

function siteConfigGlobal() {
  return {
    siteName: 'COIN',
    tagline: ls('We design, build and operate services to ensure business continuity and cyber resilience for organisations with mission critical employees'),
    contactEmail: 'info@coin-bc.com',
    phoneNL: '+31 88 26 46 000',
    phoneLU: '+352 357 05 30',
    linkedinUrl: 'https://www.linkedin.com/company/coin-business-continuity/',
    companyLegal: {
      name: 'COIN International B.V.',
      kvk: '88004708',
      address: 'Tupolevlaan 41, 1119 PA Schiphol-Rijk',
    },
    footerDescription: ls(
      'COIN AS is the BeNeLux leader in business continuity and cyber resilience. For over 20 years, we design, build and operate services to ensure that organisations with mission critical employees can respond to any disruption, from cyber attacks to natural disasters.',
    ),
    copyright: ls('All rights reserved.'),
    ...ts(),
  };
}

function navigationMain() {
  return {
    items: [
      // NOTE: Challenges hidden from nav per client request — pages still exist at /challenges/*
      // {
      //   label: ls('Challenges'),
      //   path: '/challenges',
      //   order: 0,
      //   children: [
      //     { label: ls('Banking & Finance'), path: '/challenges/banking-finance', order: 0 },
      //     { label: ls('Insurance'), path: '/challenges/insurance', order: 1 },
      //     { label: ls('Utilities & Energy'), path: '/challenges/utilities-energy', order: 2 },
      //     { label: ls('Government & Public'), path: '/challenges/government-public', order: 3 },
      //   ],
      // },
      {
        label: ls('Services'),
        path: '/services',
        order: 1,
        children: [
          { label: ls('Overview of Services'), path: '/services', order: 0 },
          { label: ls('Recovery Workplaces'), path: '/services/recovery-workplaces', order: 1 },
          { label: ls('Consultancy and Training'), path: '/services/consultancy-and-training', order: 2 },
          { label: ls('IT Housing'), path: '/services/it-housing', order: 3 },
          { label: ls('Cyberresilience'), path: '/services/cyberresilience', order: 4 },
          { label: ls('Crisis Management'), path: '/services/crisis-management', order: 5 },
        ],
      },
      {
        label: ls('Resources'),
        path: '/knowledge-hub',
        order: 2,
        children: [
          { label: ls('Articles'), path: '/knowledge-hub/articles', order: 0 },
          { label: ls('Case Studies'), path: '/knowledge-hub/case-studies', order: 1 },
          { label: ls('Videos'), path: '/knowledge-hub/videos', order: 2 },
          { label: ls('White Papers'), path: '/knowledge-hub/white-papers', order: 3 },
          { label: ls('News & Events'), path: '/news', order: 4 },
          { label: ls('FAQ'), path: '/knowledge-hub/faq', order: 5 },
        ],
      },
      {
        label: ls('About Us'),
        path: '/about',
        order: 3,
        children: [
          { label: ls('Our Mission'), path: '/about#mission', order: 0 },
          { label: ls('Our Values'), path: '/about#values', order: 1 },
          { label: ls('Our Experts'), path: '/about#teams', order: 2 },
          { label: ls('Our Partners'), path: '/partners', order: 3 },
          { label: ls('Our Customers'), path: '/about#customers', order: 4 },
          { label: ls('Our Locations'), path: '/about#locations', order: 5 },
          { label: ls('Our History'), path: '/about#history', order: 6 },
          { label: ls('FAQ'), path: '/knowledge-hub/faq', order: 7 },
        ],
      },
      { label: ls('Contact'), path: '/contact', order: 4, children: null },
    ],
    ...ts(),
  };
}

function navigationFooter() {
  return {
    columns: [
      {
        heading: ls('About COIN'),
        links: [
          { label: ls('Our Mission'), path: '/about#mission' },
          { label: ls('Our Values'), path: '/about#values' },
          { label: ls('Our Experts'), path: '/about#teams' },
          { label: ls('Our Partners'), path: '/partners' },
          { label: ls('Our Customers'), path: '/about#customers' },
          { label: ls('Our History'), path: '/about#history' },
          { label: ls('Our Locations'), path: '/locations' },
          { label: ls('FAQ'), path: '/knowledge-hub/faq' },
        ],
      },
      {
        heading: ls('Services'),
        links: [
          { label: ls('Consulting & Training'), path: '/services/consultancy' },
          { label: ls('Business Continuity Centres'), path: '/services/business-continuity' },
          { label: ls('Cyber Resilience Solutions'), path: '/services/cyber-resilience' },
          { label: ls('Dedicated Recovery Sites'), path: '/services/recovery-workplaces' },
          { label: ls('Satellite Offices & Co-location'), path: '/services/satellite-offices' },
        ],
      },
      {
        heading: ls('Ressources'),
        links: [
          { label: ls('Articles'), path: '/knowledge-hub' },
          { label: ls('News & Events'), path: '/news' },
          { label: ls('Case Studies'), path: '/knowledge-hub?category=case_study' },
          { label: ls('FAQ'), path: '/knowledge-hub/faq' },
        ],
      },
      {
        heading: ls('Contact'),
        links: [
          { label: ls('Contact Us'), path: '/contact' },
          { label: ls('Legal Notice'), path: '/legal-notice' },
          { label: ls('Privacy Policy'), path: '/privacy-policy' },
          { label: ls('Cookies Policy'), path: '/cookies-policy' },
        ],
      },
    ],
    ...ts(),
  };
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function pageHome() {
  return {
    slug: 'home',
    title: ls('Home'),
    seo: {
      metaTitle: ls('Business Continuity Innovation'),
      metaDescription: ls(
        'Test your business continuity plan with COIN. Over 20 years dedicated to business continuity in the BeNeLux.',
      ),
      ogImage: null,
    },
    sections: [
      {
        type: 'hero',
        order: 0,
        heading: ls('Business Continuity & Cyber Resilience for the BeNeLux'),
        bulletPoints: [
          ls('20 years of experience - BeNeLux leader in Business Continuity'),
          ls('Over 300 customers across Banking, Insurance, Utilities and Government'),
          ls('4 Resilience Centres with 1,000+ workplaces across Belgium, Netherlands and Luxembourg'),
          ls('ISO 27001/2022 certified - supporting 350+ Business Continuity Plans'),
          ls('Senior experts who know what it means to manage disasters and critical situations'),
        ],
        primaryButtonText: ls('Contact us'),
        primaryButtonLink: '/contact',
        secondaryButtonText: ls('Our services'),
        secondaryButtonLink: '/services',
        backgroundImageUrl: '/images/coin/coin-fotosharonwillems-36.webp',
      },
      {
        type: 'service_pillars',
        order: 1,
        heading: ls('We enable customers to improve their resilience in three key areas'),
        subtitle: ls(
          'COIN has a unique blend of competences in Business Continuity, Digital Workplaces, Facility Management, High Resiliency Systems and Security. We are dedicated to helping organisations with mission critical employees prepare for, respond to, and recover from any disruption.',
        ),
        ctaText: ls('Discover our solutions'),
        pillars: [
          {
            title: ls('Business Continuity'),
            description: ls(
              'Reduce the impact of external events that disrupt business: natural disasters, office unavailability, pandemics, social events, power cuts or telecom failure.',
            ),
            tagline: ls('Prepare. Respond. Recover.'),
            imageUrl: '/images/coin/coin-fotosharonwillems-27.webp',
            link: '/services/business-continuity',
          },
          {
            title: ls('Cyber Resilience'),
            description: ls(
              'Prevent and restore from cyber incidents: ransomware, compromised laptops, compromised Active Directory, and data loss. Your teams back online in minutes, not days.',
            ),
            tagline: ls('Stay operational after any cyber attack'),
            imageUrl: '/images/coin/co-location-area-munsbach.webp',
            link: '/services/cyber-resilience',
          },
          {
            title: ls('Regulatory Compliance'),
            description: ls(
              'Means and methods to comply with regulations on cyber resilience (NIS2, DORA) and business continuity requirements for financial institutions (CSSF, DNB).',
            ),
            tagline: ls('DORA · NIS2 · CSSF · DNB compliant'),
            imageUrl: '/images/coin/coin-fotosharonwillems-58.webp',
            link: '/services/nis2-dora',
          },
          {
            title: ls('New Ways of Work'),
            description: ls(
              'Well-being, efficiency and security for hybrid work models, combining main office, homeworking and alternate offices, for employees and freelancers alike.',
            ),
            tagline: ls('Work securely from anywhere'),
            imageUrl: '/images/coin/luxembourg-munsbach-shared-seat-room-2.webp',
            link: '/services/satellite-offices',
          },
        ],
      },
      {
        type: 'featured_carousel',
        order: 2,
        heading: ls('Latest from COIN AS'),
        subtitle: ls('News, events and monthly highlights from our business continuity experts'),
        items: [
          {
            label: ls('Monthly Focus'),
            title: ls('DORA Compliance: Are You Ready for January 2025?'),
            description: ls(
              'The Digital Operational Resilience Act is now in force. Financial institutions in the EU must demonstrate tested business continuity plans, documented ICT risk management, and recovery capabilities. COIN AS helps you get compliant, fast.',
            ),
            imageUrl: '/images/coin/coin-fotosharonwillems-33.webp',
            linkText: ls('Read more'),
            linkHref: '/knowledge-hub',
          },
          {
            label: ls('New Service'),
            title: ls('Secure COIN Key: Work Securely from Anywhere After a Cyber Attack'),
            description: ls(
              'Our Secure COIN Key turns any computer into a fully managed corporate workstation. When ransomware hits and laptops are quarantined, your teams are back online in minutes, not days.',
            ),
            imageUrl: '/images/coin/coin-luxembourg-server-room-for-dedicated-site.webp',
            linkText: ls('Discover the solution'),
            linkHref: '/services/cyber-resilience',
          },
          {
            label: ls('Event'),
            title: ls('Business Continuity Exercise at Our Amsterdam Centre'),
            description: ls(
              'Our Amsterdam Resilience Centre hosts 100+ disaster recovery exercises per year. Book a full-day simulation for your team and test your BCP in a real-world environment with expert COIN AS facilitators.',
            ),
            imageUrl: '/images/coin/coin-fotosharonwillems-43.webp',
            linkText: ls('Book an exercise'),
            linkHref: '/contact',
          },
        ],
      },
      {
        type: 'innovation',
        order: 3,
        heading: ls('Innovation in Business Continuity'),
        body: ls(
          'COIN has over 20 years of experience in business continuity. Yet, each year brings its share of new risks as well as technological challenges and opportunities. Together with our partners, we continuously develop innovative and robust solutions that improve the resiliency of our customers in an increasingly complex business and regulatory environment.',
        ),
        imageUrl: '/images/coin/coin-fotosharonwillems-16.webp',
      },
      {
        type: 'flexible_services',
        order: 4,
        heading: ls('Flexible Services - Customized SLA'),
        body: ls(
          'COIN adjusts to your needs and constraints. We know business continuity objectives and regulatory requirements depend on your business, country, and resources available in your organisation. We can offer this unique level of flexibility because business continuity is our core business and we have experience with 300+ customers in various industries.',
        ),
        imageUrl: '/images/coin/coin-luxembourg-munsbach-shared-meeting-room.webp',
      },
      {
        type: 'mission_statement',
        order: 5,
        heading: ls('Your business continuity is our mission'),
        body: ls(
          "COIN teams know exactly what it means for customers with critical operations to be stricken by disrupting events such as loss of telecom line, power cuts, ransomware or pandemics. Our experts will be your first line of defence to prevent unforeseen events to disrupt your business and they are committed to be your last line of defence when you'll need to resort to contingency measures and call upon COIN's business continuity services.",
        ),
        imageUrl: '/images/coin/coin-fotosharonwillems-51.webp',
      },
      {
        type: 'stats',
        order: 6,
        stats: [
          { value: 20, suffix: '+', label: ls('Years of Experience') },
          { value: 300, suffix: '+', label: ls('Customers') },
          { value: 1000, suffix: '+', label: ls('Recovery Workplaces') },
          { value: 350, suffix: '+', label: ls('Business Continuity Plans') },
        ],
      },
      {
        type: 'testimonials_ref',
        order: 7,
        heading: ls('What our clients say'),
      },
      {
        type: 'cta_banner',
        order: 8,
        heading: ls('Ready to strengthen your business continuity?'),
        buttonText: ls('Contact us today'),
        buttonLink: '/contact',
      },
    ],
    ...ts(),
  };
}

function pageAbout() {
  return {
    slug: 'about',
    title: ls('About Us'),
    seo: {
      metaTitle: ls('About Us - Business Continuity Experts'),
      metaDescription: ls(
        "Learn about COIN's mission, teams, and 20+ years of experience in business continuity across the BeNeLux.",
      ),
      ogImage: null,
    },
    sections: [
      {
        type: 'hero_simple',
        order: 0,
        heading: ls('About COIN'),
        subtitle: ls('For over 20 years dedicated to business continuity and now the leader in the BeNeLux'),
        logoUrl: null,
        backgroundImageUrl: '/images/coin/coin-fotosharonwillems-60.webp',
      },
      {
        type: 'mission',
        order: 1,
        heading: ls('Our Mission'),
        body: ls(
          'Our mission is to increase business continuity and cyberresilience of organisations by designing and delivering customized services and infrastructure that ensure the availability of digital workplaces. We address business continuity and crisis management comprehensively from analysis of risks and crisis scenarios to provision of services and alternate infrastructure to prevent, get prepared, respond and recover from disrupting events.',
        ),
        diagramSteps: [
          ls('Improve'),
          ls('Assess'),
          ls('Prevent'),
          ls('Prepare'),
          ls('Respond'),
          ls('Recover'),
        ],
        imageUrl: '/images/coin/coin-fotosharonwillems-32.webp',
      },
      {
        type: 'values',
        order: 2,
        heading: ls('Our Values'),
        imageUrl: '/images/coin/coin-fotosharonwillems-54.webp',
        values: [
          { title: ls('Expertise'), description: ls('Over 20 years of hands-on experience in business continuity management, crisis response, and cyber resilience across the BeNeLux.') },
          { title: ls('Reliability'), description: ls('We deliver on our promises with 99.9% SLA uptime and round-the-clock support when our customers need it most.') },
          { title: ls('Innovation'), description: ls('We continuously invest in new technology and methodologies to stay ahead of evolving threats and disruptions.') },
          { title: ls('Partnership'), description: ls('We build long-term relationships with our customers, becoming a trusted extension of their team rather than just a service provider.') },
          { title: ls('Integrity'), description: ls('We operate with transparency and honesty, providing candid assessments and practical recommendations.') },
        ],
      },
      {
        type: 'teams',
        order: 3,
        heading: ls('Our Teams'),
        body: ls(
          "COIN experts brings together an unmatched level of experience in the many areas required to ensure business continuity and cyberresilience. They know that ensuring continuity is a matter of preparation, training, documented processes, redundant infrastructure but also being ready and committed to address unexpected situations as a team. The operational resiliency of our customers puts high demand on COIN teams to act transparently and reliably and be committed to the continuity of customers' activities while taking care of their staff, whatever the situation at hand.",
        ),
        imageUrl: '/images/coin/luxembourg-munsbach-shared-seat-room-2.webp',
      },
      {
        type: 'partners_preview',
        order: 4,
        heading: ls('Our Partners'),
        body: ls(
          'Maintaining business resiliency is an increasingly difficult challenge that requires to guarantee the availability and access to many human and technical resources. COIN and its partners comprehend each other with their skills and resources to enable the highest possible level of business continuity of the organisations that rely on us. Together we cover the many disrupting events and recovery scenarios for natural disaster, cyber attacks and other crisis situations.',
        ),
        imageUrl: '/images/coin/coin-fotosharonwillems-31.webp',
        ctaLink: '/partners',
        ctaButtonText: ls('View all partners'),
      },
      {
        type: 'customers',
        order: 5,
        heading: ls('Our Customers'),
        body: ls(
          'COIN customers are in industries in which time is of the essence and operational resilience is a business necessity, regardless of the size of their organisation. Our customers include banks, insurance companies, utilities, hospitals, emergency and rescue services, call centres and trading rooms, many of whom must comply with regulatory frameworks such as NIS2, DORA, or local regulation that impose alternate recovery sites or cyber resilience prevention and response measures.\n\nCOIN provides services to more than 250 organisations ranging from 10 employees up to 2,000 in Belgium, The Netherlands and Luxembourg.',
        ),
        imageUrl: '/images/coin/coin-luxembourg-contern-recovery-office-small-2.webp',
        customerSectors: [
          ls('Banking & Financial Services'),
          ls('Insurance'),
          ls('Utilities & Energy'),
          ls('Government & Public Sector'),
          ls('Healthcare'),
          ls('Telecoms & Technology'),
        ],
        logoUrls: [
          '/images/customers/frieslandcampina.png',
          '/images/customers/robeco.jpg',
          '/images/customers/mediq.png',
          '/images/customers/bat.jpg',
          '/images/customers/bkr.jpg',
          '/images/customers/crocs.jpg',
          '/images/customers/erasmus-leven.jpg',
          '/images/customers/aac.jpg',
          '/images/customers/cak.jpg',
          '/images/customers/tentoo.jpg',
          '/images/customers/intrum.png',
          '/images/customers/gemeente-amsterdam.jpg',
          '/images/customers/generali.jpg',
          '/images/customers/fca-capital.jpg',
          '/images/customers/credit-europe.jpg',
          '/images/customers/harmony.jpg',
          '/images/customers/infomedics.jpg',
          '/images/customers/howden.jpg',
          '/images/customers/ems.png',
        ],
      },
      {
        type: 'map_overview',
        order: 6,
        body: ls('COIN operates business continuity centres across Belgium, the Netherlands and Luxembourg, providing 750+ recovery workplaces and co-location facilities to keep your business running.'),
        mapImageUrl: null,
        mapEmbedUrl: null,
        isoBadgeUrl: null,
      },
      {
        type: 'timeline',
        order: 7,
        heading: ls('Our History'),
        events: [
          {
            year: '1997',
            title: ls('COIN Founded in Luxembourg'),
            description: ls(
              'COIN was founded in Luxembourg, taking over IBM\'s business continuity centre in Contern. This established COIN as the leading provider of recovery workplaces for the Luxembourg financial sector.',
            ),
          },
          {
            year: '2003',
            title: ls('Expansion to the Netherlands'),
            description: ls(
              'COIN expanded to the Netherlands, establishing a business continuity centre near Amsterdam Airport Schiphol-Rijk to serve the Dutch financial services market.',
            ),
          },
          {
            year: '2019',
            title: ls('New Luxembourg Site - Münsbach'),
            description: ls(
              'Opening of the COIN Münsbach centre (6B rue Gabriel Lippmann, L-5365), a TIER-3 facility with 500 recovery workplaces and co-location infrastructure powered by LuxConnect.',
            ),
          },
          {
            year: '2022',
            title: ls('Sungard AS Integration'),
            description: ls(
              "Integration of Sungard Availability Services' BeNeLux operations, reinforcing COIN's position as the BeNeLux leader in business continuity and cyber resilience.",
            ),
          },
          {
            year: '2023',
            title: ls('ISO 27001 Certification'),
            description: ls(
              'COIN achieved ISO 27001 certification across its sites, demonstrating its commitment to information security management and regulatory compliance.',
            ),
          },
          {
            year: '2025',
            title: ls('DORA & NIS2 Readiness'),
            description: ls(
              'COIN launches dedicated DORA and NIS2 compliance advisory services, supporting financial institutions and critical infrastructure operators across the BeNeLux in meeting new EU regulatory requirements.',
            ),
          },
        ],
      },
    ],
    ...ts(),
  };
}

function pageLocations() {
  return {
    slug: 'locations',
    title: ls('Our Locations'),
    seo: {
      metaTitle: ls('Our Locations - Business Continuity Centres'),
      metaDescription: ls(
        "Discover COIN's business continuity centres across the BeNeLux: Schiphol-Rijk, Munsbach, and Contern.",
      ),
      ogImage: null,
    },
    sections: [
      {
        type: 'hero_simple',
        order: 0,
        heading: ls('Our Locations'),
        subtitle: ls('Business continuity centres across the BeNeLux'),
        logoUrl: null,
        backgroundImageUrl: '/images/coin/coin-luxembourg-contern-shared-room.webp',
      },
      {
        type: 'map_overview',
        order: 1,
        body: ls(
          'COIN offers business continuity services in The Netherlands, Luxembourg and Belgium and is the only business continuity specialist providing consistent level of services across the BeNeLux. The services are delivered at COIN business centers and at customer premises.\n\nCOIN operates 4 resilience centres: 2 redundant shared sites in Luxembourg (Munsbach and Contern), one shared site near Amsterdam Schiphol-Rijk, and a dedicated site in Antwerp, Belgium.\n\nEach site features a crisis management room, dedicated and shared recovery offices with a range of facility and IT options. All sites are equipped with high-resilient power and IT systems, multiple telecom provider access, and physical/digital security compliant with ISO 27001.',
        ),
        mapImageUrl: null,
        mapEmbedUrl: 'https://maps.google.com/maps?q=50.5,4.8&t=&z=7&ie=UTF8&iwloc=&output=embed',
        isoBadgeUrl: null,
      },
      {
        type: 'room_types',
        order: 2,
        imageUrl: '/images/coin/coin-luxembourg-contern-disaster-recovery-office-small.webp',
        rooms: [
          {
            name: ls('Crisis Management Room'),
            description: ls(
              'Dedicated spaces for crisis team coordination, equipped with communication tools, video conferencing, and real-time monitoring dashboards.',
            ),
          },
          {
            name: ls('Dedicated Recovery Room'),
            description: ls(
              'Private recovery environments exclusively assigned to your organisation, pre-configured with your specific IT setup and ready for immediate activation.',
            ),
          },
          {
            name: ls('Shared Recovery Room'),
            description: ls(
              'Cost-effective shared recovery spaces that provide flexible seating and IT infrastructure on a first-come, first-served basis.',
            ),
          },
          {
            name: ls('Co-location'),
            description: ls(
              'Secure rack space for your critical IT infrastructure with redundant power, cooling, and network connectivity.',
            ),
          },
          {
            name: ls('Dedicated Site'),
            description: ls(
              'A complete standalone recovery facility dedicated to your organisation, offering maximum security and customisation.',
            ),
          },
        ],
      },
      {
        type: 'site_gallery',
        order: 3,
        sites: [
          {
            name: ls('Schiphol-Rijk'),
            country: ls('The Netherlands'),
            address: 'Schiphol-Rijk',
            phone: '+31 88 26 46 000',
            imageUrl: '/images/coin/dedicated-site-meeting-room-screen.webp',
            description: ls(
              'COIN Netherlands headquarters and primary business continuity centre, strategically located near Amsterdam Airport Schiphol. The facility offers dedicated and shared recovery rooms, a crisis management suite, and co-location services for Dutch and international clients.',
            ),
            capacity: ls('Recovery workplaces · Crisis management rooms · Co-location'),
            mapUrl: 'https://maps.google.com/?q=Schiphol-Rijk,+Netherlands',
          },
          {
            name: ls('Munsbach'),
            country: ls('Luxembourg'),
            address: 'Munsbach',
            phone: '+352 357 05 30',
            imageUrl: '/images/coin/coin-luxembourg-munsbach-reception-area-2.webp',
            description: ls(
              "COIN's primary Luxembourg facility, a TIER-3 certified data centre and business continuity centre with 500 recovery workplaces. Co-location infrastructure is powered in partnership with LuxConnect. The site serves Luxembourg's financial sector and CSSF-regulated organisations.",
            ),
            capacity: ls('500 recovery workplaces · TIER-3 · ISO 27001'),
            mapUrl: 'https://maps.google.com/?q=Munsbach,+Luxembourg',
          },
          {
            name: ls('Contern'),
            country: ls('Luxembourg'),
            address: 'Contern',
            phone: '+352 357 05 30',
            imageUrl: '/images/coin/coin-luxembourg-contern-disaster-recovery-office-reception-area.webp',
            description: ls(
              "COIN's second Luxembourg site, located in Contern approximately 10 minutes from Munsbach. The facility provides 250 recovery workplaces, offering geographic redundancy for organisations requiring dual-site recovery arrangements within Luxembourg.",
            ),
            capacity: ls('250 recovery workplaces · 10 min from Munsbach'),
            mapUrl: 'https://maps.google.com/?q=Contern,+Luxembourg',
          },
          {
            name: ls('Antwerp'),
            country: ls('Belgium'),
            address: 'Antwerp',
            phone: '+32 2 513 36 18',
            imageUrl: '/images/coin/coin-luxembourg-contern-disaster-recovery-office-big.webp',
            description: ls(
              "COIN's dedicated business continuity centre in Belgium, located in Antwerp. The facility serves Belgian organisations requiring a dedicated recovery environment, providing exclusive workplaces and crisis management facilities.",
            ),
            capacity: ls('Dedicated recovery workplaces · Crisis management'),
            mapUrl: 'https://maps.google.com/?q=Antwerp,+Belgium',
          },
        ],
      },
    ],
    ...ts(),
  };
}

function pageContact() {
  return {
    slug: 'contact',
    title: ls('Contact'),
    seo: {
      metaTitle: ls('Contact Us'),
      metaDescription: ls(
        'Get in touch with COIN for business continuity services in the BeNeLux.',
      ),
      ogImage: null,
    },
    sections: [
      {
        type: 'contact_info',
        order: 0,
        heading: ls('Contact us'),
        subtitle: ls(
          'COIN operates from 4 centres across the BeNeLux. Reach us directly.',
        ),
        phones: [
          { label: ls('Netherlands'), number: '+31 88 26 46 000' },
          { label: ls('Luxembourg'), number: '+352 357 05 30' },
          { label: ls('Belgium'), number: '+32 2 513 36 18' },
        ],
      },
      {
        type: 'contact_form',
        order: 1,
        formLabels: {
          subject: ls('Subject'),
          company: ls('Company'),
          name: ls('Name'),
          phone: ls('Phone'),
          email: ls('Email'),
          country: ls('Country'),
          message: ls('Message'),
          submit: ls('Send Message'),
        },
        subjectOptions: [
          ls('Business Continuity Consulting'),
          ls('Recovery Workplaces'),
          ls('Cyber Resilience'),
          ls('Training & Exercises'),
          ls('NIS2 / DORA Compliance'),
          ls('Partnership Enquiry'),
          ls('Other'),
        ],
        countryOptions: [
          ls('The Netherlands'),
          ls('Luxembourg'),
          ls('Belgium'),
          ls('Other'),
        ],
        privacyText: ls(
          'By submitting this form, you agree to our Privacy Policy and consent to being contacted by COIN regarding your enquiry.',
        ),
        gdprConsentText: ls(
          'I consent to COIN processing my personal data in accordance with the Privacy Policy. *',
        ),
        confirmationMessage: ls(
          'Thank you for your message. Our team will contact you within 24 hours.',
        ),
      },
    ],
    ...ts(),
  };
}

function pageLegalNotice() {
  return {
    slug: 'legal-notice',
    title: ls('Legal Notice'),
    seo: {
      metaTitle: ls('Legal Notice'),
      metaDescription: ls('Legal notice and company information for COIN International B.V.'),
      ogImage: null,
    },
    body: ls(
      '## Legal Notice and terms of use\n\n### Ownership\n\nThis website and its content belongs to:\nCOIN International B.V., registered in The Netherlands with number (KvK) number 88004708.\nThe address is Tupolevlaan 41, 1119 NW Schiphol-Rijk, The Netherlands.\nE-mail contact: info@coin-bc.com\nThe applicable laws and legal juridictions are those of The Netherlands.\n\nCOIN is the brand name of COIN International and its subsidiaries.\nEach subsidiary of COIN International is a separate legal entity without responsibility or liability for other entities of the group.\n\nThe site is designed and hosted by The Dots.\n\n### Use of the site and Intellectual property rights\n\nThe content of the site is property of COIN and can\'t be duplicated or referenced without permission. COIN prohibits unauthorized hyperlinks to its website other than the main page. COIN does not allow use of excerpt or claims based on information published on this site. Any copy of content, including in search engine must clearly indicate COIN as source of information.\nThis website may contain links to other websites, please inform about the terms of use of such third party websites.\n\n### AI Opt-Out\n\nCOIN explicitly opts-out for AI training and does not allow any organisation or individual to use the content of this web site for the purpose of training AI model. COIN prohibits unauthorized access to the site by AI scrappers, AI crawlers, or similar technology.\n\n### Disclaimer\n\nThis site has been built to provide information about COIN organisation and services. COIN believes that implementing business continuity practices are of value for the society and therefore share information on this website for the purpose of helping other organisations to increase their resiliency. However, risks, regulations and constraints are specific to each organisation and are continuously changing. The examples and concepts provided on COIN website may not be applicable for your organization and visitors should not consider these as recommendations from COIN. COIN accept no responsibility or liability for the consequence of use of content on this website or content of third-party websites to which this site is referring to.',
    ),
    sections: [],
    ...ts(),
  };
}

function pagePrivacyPolicy() {
  return {
    slug: 'privacy-policy',
    title: ls('Privacy Policy'),
    seo: {
      metaTitle: ls('Privacy Policy'),
      metaDescription: ls(
        'Privacy policy for COIN International B.V. - how we handle your personal data.',
      ),
      ogImage: null,
    },
    body: ls(
      '## Privacy Policy\n\nVersion 1.1 - Last Update 28/01/2026\n\n### Personal data that can be processed\n\nCOIN International BV can process your personal data because you are using the services of COIN and/or because you have provided this data yourself by completing a form on the COIN website. COIN can process the following personal data:\n\n- Your first and last name\n- Your address details\n- Your telephone number\n- Your e-mail address\n- Your IP address\n- Your company name and company address details\n- Information about your location, device, browser settings and browsing history\n\n### Why COIN needs this data\n\n**Contract performance**\n\nCOIN can use your personal data within the framework of performing a contract for services that has been concluded with you, for example in order to send you a newsletter.\n\n**To contact you after a call-back request**\n\nCOIN processes your personal data in order to be able to call you if you have requested a call-back and/or to write to you (by e-mail and/or post) in the event you cannot be contacted by telephone.\n\n**Newsletter**\n\nIf you subscribe to our newsletter your permission for this will be requested twice. Firstly, you enter your details on our website, after which you receive a confirmation e-mail. This e-mail contains a link that you click on to confirm that you wish to subscribe to the newsletter.\n\nTo be able to send a personalised newsletter we require your e-mail address and your full name. This information is only used for sending the newsletter. You can unsubscribe from our newsletter at any time by clicking on the link at the bottom of every newsletter. This link can also be found on our contact page.\n\nWe use MailChimp for our newsletters. By subscribing to our newsletter you accept that the transmitted data will be processed by MailChimp and you accept the privacy statement and the General Terms and Conditions of MailChimp.\n\n### COIN\'s data retention period\n\nCOIN does not retain your personal data for longer than is strictly necessary for the purpose for which your data was collected. Your data is not stored for longer than 26 months if we have not concluded a contract with you or after a contract has ended.\n\n### Sharing with third parties\n\nCOIN only shares your personal data with third parties if this is necessary for the performance of a contract with you, to meet a legal obligation or to optimise, improve and protect the operation of our website. This also includes sharing information with web applications, suppliers and hosting providers when that information is required for the operation of our website and web functionalities, such as a chat function. We shall handle this data with due care by transmitting it in an anonymised manner as far as possible and by concluding a processor agreement with third parties who offer such an agreement.\n\n### Reviewing, correcting or deleting\n\nYou have the right to review, correct and delete you personal data. You can submit review, correction or deletion requests by post or by sending an e-mail to us via the contact information at the bottom and top of this page. COIN will respond to your request as soon as possible, within four weeks.\n\n### Security\n\nCOIN takes the protection of your data seriously and has implemented appropriate measures to prevent misuse, loss, unauthorised access, inappropriate disclosure and unauthorised amendment. COIN\'s website uses a trusted SSL Certificate in order to protect your personal data.',
    ),
    sections: [],
    ...ts(),
  };
}

function pageCookiesPolicy() {
  return {
    slug: 'cookies-policy',
    title: ls('Cookies Policy'),
    seo: {
      metaTitle: ls('Cookies Policy'),
      metaDescription: ls('Learn about how COIN uses cookies on this website.'),
      ogImage: null,
    },
    body: ls(
      '## Cookies Policy\n\nVersion 1.1 - Last Update 28/01/2026\n\nTo optimise, improve and protect our website\n\nCookies are files, stored on your computer, which are used to identify users or for adding products to a shopping cart for example. These cookies can be deleted at any time via your computer\'s browser settings.\n\nThe purposes and types of cookies that we use are:\n\n### Necessary functional cookies\n\nWe use functional cookies, which are required for the correct operation of our website and provide a good experience to visitors.\n\n### Preference cookies\n\nThe preference cookies allow us to present information in the language and for the country that you selected when you first access our site our change your preferences.\n\n### Statistical cookies\n\nWe use analytics cookies to understand how visitors interact with our website. These cookies collect information anonymously to help us improve the website experience.\n\n### Marketing cookies\n\nWe may use marketing cookies to deliver relevant content and advertisements based on your browsing activity.\n\n### Use of other visitor data such as IP address\n\nThe COIN website captures general visitor data, including the IP address of your computer, the page request time and the data sent by your browser. This data is used to analyse visit and click behaviour on the website, for protecting our website and for the correct operation of our website and associated plug-ins or web applications. COIN uses this information to optimise, improve and protect the operation of the website. COIN can share this data with third parties or third-party applications such as Google Analytics. This data shall only be shared with third parties in order to optimise, improve and protect COIN\'s website.\n\n### Use of other plug-in scripts and web fonts\n\nOur website uses JavaScript code in order for it to work and display correctly. This code can also originate from an external party, such as Google Web Fonts.\n\nIf you activate JavaScript in your browser and do not have a JavaScript blocker installed then your browser can potentially forward personal data when a code is loaded by one of our suppliers. We do not know what data is linked to the information received, or the purposes for which this data is used. You can block JavaScript code by installing a JavaScript blocker (www.noscript.net for example).',
    ),
    sections: [],
    ...ts(),
  };
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

function servicesData() {
  return [
    {
      slug: 'overview',
      title: ls('Our Services'),
      shortTitle: ls('Overview'),
      category: 'consulting',
      order: 0,
      heroSubtitle: ls('Comprehensive business continuity solutions for the BeNeLux'),
      heroImageUrl: '/images/coin/coin-fotosharonwillems-51.webp',
      overview: ls('COIN offers a complete range of business continuity services...'),
      sections: [
        {
          type: 'rich_text',
          order: 0,
          heading: ls('Complete Business Continuity Solutions'),
          body: ls(
            'From consulting and training to fully equipped recovery facilities and cyberresilience solutions, COIN provides everything you need to ensure your organisation can continue operating during any disruption.',
          ),
        },
      ],
    },
    {
      slug: 'consultancy-and-training',
      title: ls('Consultancy and Training'),
      shortTitle: ls('Consultancy and Training'),
      category: 'consulting',
      order: 2,
      heroSubtitle: ls('Experienced consultants covering the full business continuity cycle'),
      heroImageUrl: '/images/coin/coin-fotosharonwillems-26.webp',
      overview: ls(
        'Experienced consultants covering the full business continuity cycle. From risk assessment to disaster simulation, COIN helps you build, document, test and maintain your continuity and contingency plans.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Our Consultancy and Training solution'),
          features: [
            {
              title: ls('Risks and Business Impact Analysis'),
              description: ls(
                'Identify your critical processes, quantify the impact of disruption, and map the dependencies between people, systems, suppliers and facilities. The foundation of any serious continuity plan.',
              ),
            },
            {
              title: ls('Business Continuity and Contingency Plans'),
              description: ls(
                'COIN consultants help you design, write and maintain your Business Continuity Plans and contingency procedures. Tailored to your regulatory framework (NIS2, DORA, CSSF, DNB, NBB) and business reality.',
              ),
            },
            {
              title: ls('DRP and Recovery site Assessment'),
              description: ls(
                'Independent audit of your existing Disaster Recovery Plan and recovery infrastructure. Gap analysis, risk mapping, and actionable recommendations to strengthen your resilience posture.',
              ),
            },
            {
              title: ls('Disaster Simulations & Testing'),
              description: ls(
                'Full-scale disaster simulations, crisis exercises and annual tests of your continuity plans. COIN centres host 100+ exercises every year, with experienced facilitators and scenario designers.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'it-housing',
      title: ls('IT Housing'),
      shortTitle: ls('IT Housing'),
      category: 'centers',
      order: 3,
      heroSubtitle: ls('IT housing facilities co-located with our recovery offices in Luxembourg'),
      heroImageUrl: '/images/coin/co-location-area-munsbach.webp',
      overview: ls(
        'IT housing facilities co-located with our recovery offices in Luxembourg. TIER-3 infrastructure with redundant power, cooling and connectivity, powered by green electricity.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Our IT Housing solution'),
          features: [
            {
              title: ls('Secured 24x7 autonomous access'),
              description: ls(
                'Permanent access to your equipment, with individual badge-based access control and full audit logs. Biometric entry available for sensitive zones.',
              ),
            },
            {
              title: ls('Redundant power and HVAC systems'),
              description: ls(
                'Dual power feeds, UPS systems and diesel generators. Redundant cooling with precision HVAC to maintain optimal temperature and humidity at all times.',
              ),
            },
            {
              title: ls('High speed connections with main ISP'),
              description: ls(
                'Meet-me room with a large presence of telecom providers. Direct connectivity to the LuxConnect fiber ring for ultra-low latency and multi-carrier redundancy.',
              ),
            },
            {
              title: ls('Full racks and half racks in shared co-location area'),
              description: ls(
                'Options include 23U half racks and 47U full racks in the shared co-location area. Ideal for companies needing flexible, scalable hosting capacity.',
              ),
            },
            {
              title: ls('Cages'),
              description: ls(
                'Physically separated steel cages for enhanced security. Fully customisable space with dedicated power and cooling allocation.',
              ),
            },
            {
              title: ls('Separated secured rooms'),
              description: ls(
                'Private datarooms for customers with the highest security and compliance requirements. Dedicated access, monitoring and environmental controls.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'cyberresilience',
      title: ls('Cyberresilience'),
      shortTitle: ls('Cyberresilience'),
      category: 'cyber',
      order: 4,
      heroSubtitle: ls('A range of services to prevent and respond to cyberincidents'),
      heroImageUrl: '/images/coin/coin-luxembourg-common-area-2.webp',
      overview: ls(
        'A range of services to prevent and respond to cyberincidents. From user awareness to clean recovery environments, COIN helps you reduce your cyber exposure and recover fast when things go wrong.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Our Cyberresilience solution'),
          features: [
            {
              title: ls('SAAS for security awareness and behavioural change'),
              description: ls(
                'Hoxhunt-based training platform that turns every employee into a human firewall. Gamified phishing simulations, micro-trainings and measurable behaviour change across your organisation.',
              ),
            },
            {
              title: ls('Clean Azure and Office 365 Tenant'),
              description: ls(
                'A pre-configured, hardened and monitored Microsoft 365 environment ready to take over if your production tenant is compromised. Quick activation, full email and collaboration continuity.',
              ),
            },
            {
              title: ls('Secure COIN Key for laptop recovery and BYOD'),
              description: ls(
                'An IGEL-based secure USB key that turns any laptop into a trusted corporate workstation. Ideal for remote workers, incident response teams and BYOD scenarios.',
              ),
            },
            {
              title: ls('Emergency Laptop Storage and update services'),
              description: ls(
                'Pre-configured emergency laptops stored at COIN sites, kept up to date and ready to dispatch within hours. Ideal for large-scale endpoint recovery after a ransomware incident.',
              ),
            },
            {
              title: ls('Immutable OS and Backup solutions'),
              description: ls(
                'Immutable operating systems that cannot be tampered with, plus air-gapped and immutable backup solutions to guarantee clean recovery data after a cyber incident.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'business-continuity',
      title: ls('Business Continuity'),
      shortTitle: ls('Business Continuity'),
      category: 'consulting',
      order: 1,
      heroSubtitle: ls('Assist customers to ensure employees can continue to perform mission critical activities in case of disaster'),
      heroImageUrl: '/images/coin/coin-fotosharonwillems-26.webp',
      overview: ls(
        'Our senior Business Continuity experts are practitioners with former responsibility as BC Managers, DRP managers, Facility Managers or IT Managers. They focus on realistic scenarios and pragmatic recovery solutions, and assist customers to build BCM plans that resist stress tests and disaster simulations.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Our Four-Phase Business Continuity Cycle'),
          features: [
            {
              title: ls('1. Identification of Risks and Disaster Scenarios'),
              description: ls(
                'Review, update and/or define the Business Impact Analysis (BIA). Establish Recovery Time Objectives (RTO) with associated Recovery Point Objectives (RPO). Identify all disaster scenarios relevant to your organisation and sector.',
              ),
            },
            {
              title: ls('2. Business Impact Analysis'),
              description: ls(
                'Assess the criticality of each business function and the financial, operational and reputational impact of disruption. Define the priority order of recovery and acceptable downtime for each process.',
              ),
            },
            {
              title: ls('3. Business Continuity Plan'),
              description: ls(
                'Review and/or creation of Business Continuity Plans. Build or update existing plans with clear procedures, roles, responsibilities and communication strategies for crisis situations.',
              ),
            },
            {
              title: ls('4. Disaster Recovery Simulation and Testing'),
              description: ls(
                'Define scope and frequency with scenarios if appropriate. Manage, coordinate, implement and report on DR exercises. Follow up on findings, feedback and lessons learned to continuously improve your BCP.',
              ),
            },
          ],
        },
        {
          type: 'rich_text',
          order: 1,
          heading: ls('Trusted by 300+ organisations across the BeNeLux'),
          body: ls(
            'COIN supports 350+ Business Continuity Plans across Banking, Insurance, Utilities, Government and Healthcare sectors. Our experts know what it means for organisations with critical operations to be stricken by disrupting events, and are committed to being your first and last line of defence.',
          ),
        },
      ],
    },
    {
      slug: 'crisis-management',
      title: ls('Crisis Management'),
      shortTitle: ls('Crisis Management'),
      category: 'centers',
      order: 5,
      heroSubtitle: ls('Training services and external crisis management facilities'),
      heroImageUrl: '/images/coin/coin-fotosharonwillems-36.webp',
      overview: ls(
        'Training services and external crisis management facilities. COIN provides everything you need to prepare, rehearse and respond to crisis scenarios, with dedicated rooms and experienced consultants.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Our Crisis Management solution'),
          features: [
            {
              title: ls('Simulation of crisis scenarios and management response'),
              description: ls(
                'We design and run realistic crisis simulations with your teams. Scenarios are tailored to your risks and business environment, with observers and coaches to debrief and identify improvement points.',
              ),
            },
            {
              title: ls('Crisis response plans'),
              description: ls(
                'COIN consultants help you build, document and maintain your crisis response plans, covering communication, decision-making, escalation and recovery procedures.',
              ),
            },
            {
              title: ls('Crisis management rooms and offices'),
              description: ls(
                'Fully equipped, redundant crisis management facilities ready for immediate use. Available 24/7, with COIN engineers on call to support invocation and setup.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'cyber-resilience',
      title: ls('Cyberresilience Solutions'),
      shortTitle: ls('Cyberresilience'),
      category: 'cyber',
      order: 3,
      heroSubtitle: ls('Prevent and restore from cyber incidents: ransomware, compromised laptops, data loss'),
      heroImageUrl: '/images/coin/coin-luxembourg-common-area-2.webp',
      overview: ls(
        'When a cyber attack strikes, every minute counts. COIN\'s cyber resilience solutions ensure your teams can continue operating, even when laptops are compromised, your Active Directory is down, or ransomware has encrypted your data.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Our Cyber Resilience Solutions'),
          features: [
            {
              title: ls('Secure COIN Key - Virtual Desktops After a Cyber Attack'),
              description: ls(
                'A USB key with an immutable, secure OS that turns any computer into a safe and centrally managed workstation. After rebooting from the Secure COIN Key, the device gets access to your Enterprise Virtual Infrastructure (Citrix, VMware Horizon, Azure Virtual Desktop, Microsoft Teams). When laptops are quarantined, your teams are back online in minutes, not days.',
              ),
            },
            {
              title: ls('Secure Laptops - Up and Running Wherever Needed'),
              description: ls(
                'Storage of fully pre-configured laptops at a safe location (access security, fire and flood proof). Including switch, WiFi access and firewall. Secure connectivity to your corporate network for updates and patching. Logistics services: delivery to COIN centres, transport to alternative locations or shipment to end-users.',
              ),
            },
            {
              title: ls('Bulk Re-provisioning of Laptops'),
              description: ls(
                'When the security incident has been mitigated, COIN assists with the rebuilding of all laptops with a clean, safe image, ensuring your entire workforce reconnects to a restored corporate environment.',
              ),
            },
            {
              title: ls('BCP Design, Operating and Testing'),
              description: ls(
                'Design of the cyber resilience solution depending on your DR scenario. Procedures for updates, maintenance, use and distribution. Regular BCP tests to ensure the solution works when you need it most.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'recovery-workplaces',
      title: ls('Recovery Workplaces'),
      shortTitle: ls('Recovery Workplaces'),
      category: 'centers',
      order: 1,
      heroSubtitle: ls('Fully equipped, secured and connected offices to resume work in case of disaster'),
      heroImageUrl: '/images/coin/coin-luxembourg-contern-recovery-office-small-2.webp',
      overview: ls(
        'Fully equipped, secured and connected offices to resume work in case of disaster. COIN operates 1,000+ recovery workplaces across 4 resilience centres in the BeNeLux, ready for immediate activation 24/7.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Our Recovery Workplaces solution'),
          features: [
            {
              title: ls('Dedicated recovery offices with permanent access'),
              description: ls(
                'Permanent dedicated workplaces, always up and running. Designed to your requirements with physical security, IT equipment, dedicated meeting room and kitchenette. Individual badge per user, full access logs recorded.',
              ),
            },
            {
              title: ls('Shared recovery positions with 24x7 access within 2 hours'),
              description: ls(
                'SLA of 2 hours during business hours, 4 hours outside. Once invoked, use for 3 months at no additional cost. Annual testing days included.',
              ),
            },
            {
              title: ls('Outsourcing of dedicated site anywhere in BeNeLux'),
              description: ls(
                'COIN rents and operates a dedicated recovery site tailored to your location and requirements. We handle site selection, design, infrastructure, security and daily operations.',
              ),
            },
            {
              title: ls('Design and Management of Satellite Office'),
              description: ls(
                'A satellite office that doubles as a disaster recovery facility. Used daily for hybrid work, instantly convertible into a full recovery site when needed. Fast implementation in 3 months.',
              ),
            },
          ],
        },
        {
          type: 'rich_text',
          order: 1,
          heading: ls('Standard workplace equipment'),
          body: ls(
            "Every recovery workplace at COIN comes fully equipped and ready to use the moment you invoke. No surprises, no delays.\n\n**Workstation setup**\n\n- Desk, chair and personal cupboard\n- Desktop computer (or bring your own laptop)\n- Dual 24-inch screens\n- Individual IP phone\n- One multifunction printer for every 10 users\n- One shredder per area\n\n**Common areas (included at no additional cost)**\n\n- Meeting rooms\n- Reception desk\n- Rest areas and lunch areas\n- Internet and Wi-Fi access\n- Reserved parking (30 spaces in Munsbach, 20 spaces in Contern)\n- Restaurant on site (dish of the day, lunch pass included)\n\n**Security and access**\n\n- 30 segregated installed areas, ranging from 6 to 76 workplaces\n- All areas secured by individual badge and PIN code\n- Full access logs recorded\n- Video recording on every site\n\n**The numbers**\n\nCOIN operates over 1,000 recovery workplaces across 4 resilience centres in the BeNeLux, including 750 seats in Luxembourg alone (500 in Munsbach, 250 in Contern)."
          ),
        },
      ],
    },
    {
      slug: 'satellite-offices',
      title: ls('Satellite Offices'),
      shortTitle: ls('Satellite Offices'),
      category: 'centers',
      order: 5,
      heroSubtitle: ls('A second office, usable for daily work and disaster recovery'),
      heroImageUrl: '/images/coin/coin-luxembourg-contern-disaster-recovery-office-small.webp',
      overview: ls(
        'COIN\'s Satellite Office solution provides an alternative, tailored workplace for secure teamwork, usable as a permanent second office for hybrid work and instantly convertible into a disaster recovery facility when needed.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Satellite Office Features'),
          features: [
            {
              title: ls('Dual-Purpose: Second Office + Disaster Recovery'),
              description: ls(
                'The satellite office combines work-life balance and productivity of your workforce. It can host temporary project teams or war rooms, and switch instantly to a full disaster recovery facility. All facilities are managed by COIN so you can focus on your business.',
              ),
            },
            {
              title: ls('Tailored Office Selection, Design and Operations'),
              description: ls(
                'COIN selects locations and sites based on your requirements. We manage floor design, project management, redundant infrastructure, furniture, access security control, monitoring, site operations, security management and facility management.',
              ),
            },
            {
              title: ls('Fast Implementation - 3 Months'),
              description: ls(
                'From contract signature to operational satellite office in 3 months. Available on temporary contracts or long-term agreements, adapted to your budget and growth plans.',
              ),
            },
            {
              title: ls('Co-location Services'),
              description: ls(
                'Secure rack space at COIN Münsbach or LuxConnect (Bettembourg/Bissen). Options: ½ rack (23U) or full rack (47U), dedicated dataroom or steel cage. Meet-me room with large telecom provider presence. TIER-3 datacenter powered by green electricity.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'virtual-workplaces',
      title: ls('Virtual Workplaces'),
      shortTitle: ls('Virtual Workplaces'),
      category: 'cyber',
      order: 6,
      heroSubtitle: ls('Secure virtual desktop infrastructure - work from anywhere after any incident'),
      heroImageUrl: '/images/coin/coin-luxembourg-munsbach-reception-area-2.webp',
      overview: ls(
        'COIN\'s virtual workplace solutions provide secure, enterprise-managed desktop environments accessible from any device, anywhere. Combined with the Secure COIN Key, your teams can be operational within minutes after a cyber attack or physical site unavailability.',
      ),
      sections: [
        {
          type: 'rich_text',
          order: 0,
          heading: ls('Enterprise Virtual Infrastructure'),
          body: ls(
            'After rebooting from a Secure COIN Key, any computer becomes a fully managed corporate workstation with access to your enterprise virtual infrastructure: Citrix Workspace App, VMware Horizon Client, Azure Virtual Desktop, Microsoft Teams, Remote Desktop, Chrome and more.\n\nOnce the security incident has been mitigated and laptops rebuilt, they can reconnect to the company\'s restored environment. This ensures complete operational continuity, without paying ransoms or waiting for hardware delivery.',
          ),
        },
      ],
    },
    {
      slug: 'dedicated-recovery-site',
      title: ls('Dedicated Recovery Site'),
      shortTitle: ls('Dedicated Site'),
      category: 'centers',
      order: 6,
      heroSubtitle: ls('A fully private, tailor-made disaster recovery facility, exclusively yours'),
      heroImageUrl: '/images/coin/coin-luxembourg-contern-disaster-recovery-office-big.webp',
      overview: ls(
        'A Dedicated Recovery Site is a private, fully equipped disaster recovery facility designed to your exact specifications. Unlike shared workplaces, your dedicated site is permanently reserved, fully furnished, and ready for immediate activation 24/7.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Dedicated Site Features'),
          features: [
            {
              title: ls('Fully Private & Secure'),
              description: ls(
                'Your own enclosed area with dedicated access control, individual badge per user, CCTV monitoring, and physical separation from other tenants. Designed according to your security requirements.',
              ),
            },
            {
              title: ls('Tailor-Made Design'),
              description: ls(
                'COIN manages floor design, project management, infrastructure, furniture, IT equipment, dedicated meeting rooms, and kitchenette. The space is configured to match your production environment.',
              ),
            },
            {
              title: ls('Always Ready - 24/7 Access'),
              description: ls(
                'Permanent 24/7 access with workplaces always "up and running". Suitable for critical users and regulated industries requiring immediate failover capability.',
              ),
            },
            {
              title: ls('Managed Operations'),
              description: ls(
                'COIN handles all facility management: redundant infrastructure, security management, site operations, cleaning, maintenance. You focus on your business continuity strategy.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'co-location',
      title: ls('Co-location Services'),
      shortTitle: ls('Co-location'),
      category: 'centers',
      order: 7,
      heroSubtitle: ls('Secure, resilient hosting for your critical IT infrastructure. TIER-3, green electricity'),
      heroImageUrl: '/images/coin/co-location-area-munsbach.webp',
      overview: ls(
        'COIN offers co-location services at our Münsbach campus (same building as the recovery seats) and in partnership with LuxConnect in Bettembourg and Bissen. Both options provide redundant power, cooling, and multi-carrier connectivity.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Co-location Options'),
          features: [
            {
              title: ls('COIN Münsbach - On-campus Co-location'),
              description: ls(
                'Located in the same campus as COIN\'s 500 recovery workplaces. Options: ½ IT rack (23U) or full IT rack (47U), dedicated dataroom or steel cage. Meet-me room with a large presence of telecom providers. TIER-3 datacenter powered by green electricity.',
              ),
            },
            {
              title: ls('LuxConnect - Bettembourg or Bissen'),
              description: ls(
                'Large possibilities of hosting services. Datacenter in TIER-2, 3 and 4. Partnership in place between COIN AS and LuxConnect. COIN Münsbach is connected to the LuxConnect fiber ring. Powered by green electricity.',
              ),
            },
            {
              title: ls('Redundant Infrastructure'),
              description: ls(
                'Both options provide redundant power supply, UPS systems, diesel generators, redundant cooling, and multiple internet and telecom provider access, ensuring maximum availability for your critical systems.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'nis2-dora',
      title: ls('NIS2 & DORA Compliance'),
      shortTitle: ls('NIS2 & DORA'),
      category: 'consulting',
      order: 8,
      heroSubtitle: ls('Business continuity and cyber resilience compliance for regulated organisations'),
      heroImageUrl: '/images/coin/coin-fotosharonwillems-58.webp',
      overview: ls(
        'Business Continuity Planning and cyber resilience are now mandatory in critical sectors under NIS2 and DORA. COIN helps you understand these regulations, assess your current position, and implement the required measures, with documented, tested plans and dedicated recovery infrastructure.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('What NIS2 and DORA Require'),
          features: [
            {
              title: ls('DORA - Digital Operational Resilience Act'),
              description: ls(
                'Mandatory from January 2025 for financial institutions in the EU. Requires documented ICT risk management, tested Business Continuity Plans, recovery capabilities, and third-party risk management. COIN helps financial institutions demonstrate full DORA compliance.',
              ),
            },
            {
              title: ls('NIS2 - Network and Information Security Directive'),
              description: ls(
                'Applies to critical sectors including energy, transport, banking, healthcare and digital infrastructure. Requires proportionate security measures, incident reporting, and business continuity management. COIN provides the infrastructure and expertise to meet NIS2 requirements.',
              ),
            },
            {
              title: ls('CSSF & DNB Requirements'),
              description: ls(
                'Luxembourg CSSF and Dutch DNB have specific operational resilience guidelines for financial institutions. COIN has served 120+ customers in the Luxembourg financial sector and has deep expertise in meeting local regulatory requirements.',
              ),
            },
            {
              title: ls('Audit Preparation & Documentation'),
              description: ls(
                'COIN provides complete documentation: site guides, access procedures, BCP plans, test reports and evidence of compliance. Our ISO 27001/2022 certification demonstrates our own commitment to the standards we help you achieve.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'consultancy',
      title: ls('Business Continuity Consultancy'),
      shortTitle: ls('Consultancy'),
      category: 'consulting',
      order: 9,
      heroSubtitle: ls('Senior BC experts with hands-on experience as BC Managers, DRP Managers and IT Managers'),
      heroImageUrl: '/images/coin/coin-fotosharonwillems-31.webp',
      overview: ls(
        'COIN\'s senior consultants are practitioners, not theorists. They have former responsibility as Business Continuity Managers, DRP managers, Facility Managers or IT Managers. They focus on realistic scenarios and pragmatic recovery solutions that resist real-world stress tests.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Consultancy Modules'),
          features: [
            {
              title: ls('Maturity Assessment'),
              description: ls(
                'Establish the level of competencies with gap analysis of capabilities, awareness and documentation. Assist with audit compliance. Understand where you are and define a realistic roadmap to improve.',
              ),
            },
            {
              title: ls('BC Policy & Strategy'),
              description: ls(
                'Review compliance with corporate objectives together with statutory/legal requirements (e.g. DORA) and third-party requirements. Define a Business Continuity policy aligned with your organisation\'s risk appetite.',
              ),
            },
            {
              title: ls('BIA - Risks and Threat Analysis'),
              description: ls(
                'Review, update and/or define the Business Impact Analysis (BIA). Establish Recovery Time Objectives (RTO) with associated Recovery Point Objectives (RPO). Identify all critical business processes and their dependencies.',
              ),
            },
            {
              title: ls('Business Continuity Plans'),
              description: ls(
                'Review and/or creation of Business Continuity Plans. Build or update existing plans with clear procedures, roles, responsibilities, communication strategies and recovery checklists.',
              ),
            },
            {
              title: ls('Testing & Exercising'),
              description: ls(
                'Define scope and frequency with scenarios if appropriate. Manage, coordinate, implement and report on exercises. Follow up on findings, feedback and lessons learned. COIN\'s centres host 100+ exercises per year.',
              ),
            },
            {
              title: ls('Incident & Crisis Management'),
              description: ls(
                'Define escalation, invocation and decision-making processes aligned with your BC plans. Prepare your management team to make the right decisions under pressure, with the right information.',
              ),
            },
            {
              title: ls('Change Management'),
              description: ls(
                'Ensure DR considerations are embedded in your organisation\'s change management process. Post-incident synchronisation and permanent improvement of BC processes.',
              ),
            },
            {
              title: ls('Management Review & Awareness'),
              description: ls(
                'Annual awareness sessions for senior management. Define the communication strategy for crisis situations. Ensure leadership buy-in and understanding of BC responsibilities.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'training',
      title: ls('Training & Exercises'),
      shortTitle: ls('Training'),
      category: 'consulting',
      order: 10,
      heroSubtitle: ls('From awareness sessions to full-scale disaster recovery exercises. 100+ per year at COIN centres'),
      heroImageUrl: '/images/coin/coin-fotosharonwillems-43.webp',
      overview: ls(
        'COIN\'s business continuity centres host over 100 disaster recovery exercises per year. Our expert facilitators help organisations test their BCPs in a real-world environment, from tabletop discussions to full invocations with live IT failover.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Training & Exercise Programmes'),
          features: [
            {
              title: ls('BC Awareness Sessions'),
              description: ls(
                'Introduction to business continuity concepts for all staff levels. Understand risks, roles and responsibilities. Build a culture of resilience throughout your organisation.',
              ),
            },
            {
              title: ls('Tabletop Exercises'),
              description: ls(
                'Structured, discussion-based exercises to validate your plans and procedures. Walk through crisis scenarios with your management team and identify gaps, without operational disruption.',
              ),
            },
            {
              title: ls('Full Disaster Recovery Simulation'),
              description: ls(
                'Full-scale DR exercises at COIN recovery centres. Real invocation of your BCP: staff relocation to COIN facilities, IT failover testing, crisis management room activation. Insightful findings report with recommendations.',
              ),
            },
            {
              title: ls('Annual Testing Included'),
              description: ls(
                'All shared and dedicated recovery workplace contracts include annual testing days managed by COIN. Use your contracted infrastructure for training, projects and annual DR simulations at no additional cost.',
              ),
            },
          ],
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

function testimonialsData() {
  return [
    {
      quote: ls(
        'COIN has transformed our approach to business continuity. Their ICT continuity platform allowed us to reduce our recovery time by 75% and significantly improve our NIS2 compliance.',
      ),
      authorName: 'Sophie Dubois',
      authorTitle: ls('CISO'),
      companyName: 'Finance Corp',
      companyLogoUrl: null,
      order: 0,
      published: true,
    },
    {
      quote: ls(
        "Since implementing COIN's solutions, our IT team is much more confident. Regular testing and 24/7 support give us invaluable peace of mind.",
      ),
      authorName: 'Thomas Van der Berg',
      authorTitle: ls('IT Director'),
      companyName: 'LogisTech BV',
      companyLogoUrl: null,
      order: 1,
      published: true,
    },
    {
      quote: ls(
        "The migration to COIN's SOC & SIEM solution went smoothly. Their team understood our specific needs as a healthcare institution and adapted their solution accordingly.",
      ),
      authorName: 'Claire Martin',
      authorTitle: ls('COO'),
      companyName: 'BelMed Healthcare',
      companyLogoUrl: null,
      order: 2,
      published: true,
    },
    {
      quote: ls(
        'With COIN, we have not only improved our resilience but also optimised our internal processes. Their comprehensive approach to continuity makes all the difference when managing critical systems.',
      ),
      authorName: 'Jan Verhoeven',
      authorTitle: ls('CTO'),
      companyName: 'Tech Innovations',
      companyLogoUrl: null,
      order: 3,
      published: true,
    },
    {
      quote: ls(
        'COIN supported us throughout our compliance journey with European financial regulations. Their expertise in operational resilience is unmatched.',
      ),
      authorName: 'Marie Leclerc',
      authorTitle: ls('Risk Manager'),
      companyName: 'BeneLux Bank',
      companyLogoUrl: null,
      order: 4,
      published: true,
    },
    {
      quote: ls(
        "COIN's expertise in the public sector was decisive for us. Their continuity solution perfectly meets government requirements and has enabled us to maintain essential services under all circumstances.",
      ),
      authorName: 'Paul Jansen',
      authorTitle: ls('Director'),
      companyName: 'Public Services NL',
      companyLogoUrl: null,
      order: 5,
      published: true,
    },
  ];
}

// ---------------------------------------------------------------------------
// Partners
// ---------------------------------------------------------------------------

function partnersData() {
  return [
    {
      name: 'IGEL',
      type: 'technology',
      logoUrl: '',
      description: ls(
        'COIN is an IGEL velocity managed service partner. We use IGEL immutable OS to provide secured and remotely managed workstations in our business continuity centers, for homeworking recovery and BYOD collaboration scenario.',
      ),
      websiteUrl: 'https://www.igel.com',
      videoUrl: 'https://www.youtube.com/watch?v=qRIA_nxWI1Q',
      videoCaption: ls(
        'IGEL client case: how COIN uses IGEL OS for recovery workplaces. An interview of COIN CTO by IGEL.',
      ),
      order: 0,
      published: true,
    },
    {
      name: 'Hoxhunt',
      type: 'technology',
      logoUrl: '',
      description: ls(
        'Hoxhunt Security Awareness is the product we use for our own organisation and that we resell to customers to automate and manage security awareness and phishing trainings. COIN and Hoxhunt both understand that while human behaviour create risks, people are also the first line of defense or an organisation.',
      ),
      websiteUrl: 'https://www.hoxhunt.com',
      order: 1,
      published: true,
    },
    {
      name: 'Zerto',
      type: 'technology',
      logoUrl: '',
      description: ls(
        'Leading provider of disaster recovery, backup, and workload mobility solutions.',
      ),
      websiteUrl: 'https://www.zerto.com',
      order: 2,
      published: true,
    },
    {
      name: 'Daisy Corporate Services',
      type: 'business',
      logoUrl: '',
      description: ls(
        'Business continuity and workplace recovery services provider in the UK.',
      ),
      websiteUrl: 'https://www.daisygroup.com',
      order: 3,
      published: true,
    },
  ];
}

// ---------------------------------------------------------------------------
// Team Members
// ---------------------------------------------------------------------------

function teamMembersData() {
  return [
    {
      name: 'Management Team',
      position: ls('Leadership'),
      bio: ls(
        'The COIN management team brings decades of combined experience in business continuity, IT services, and crisis management.',
      ),
      photoUrl: null,
      linkedinUrl: null,
      order: 0,
      published: true,
    },
    {
      name: 'Consulting Team',
      position: ls('Consultants'),
      bio: ls(
        'Our consulting team consists of certified business continuity professionals who work directly with clients to assess, plan, and improve their resilience.',
      ),
      photoUrl: null,
      linkedinUrl: null,
      order: 1,
      published: true,
    },
    {
      name: 'Operations Team',
      position: ls('Operations'),
      bio: ls(
        'Our operations team manages our business continuity centres and ensures all facilities are maintained to the highest standards, ready for activation at any time.',
      ),
      photoUrl: null,
      linkedinUrl: null,
      order: 2,
      published: true,
    },
  ];
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedSiteConfig(db: Firestore) {
  console.log('[1/7] Seeding site_config...');
  await setDoc(doc(db, 'site_config', 'global'), siteConfigGlobal(), { merge: true });
  console.log('  -> site_config/global written');
}

async function seedNavigation(db: Firestore) {
  console.log('[2/7] Seeding navigation...');
  await setDoc(doc(db, 'navigation', 'main'), navigationMain(), { merge: true });
  console.log('  -> navigation/main written');
  await setDoc(doc(db, 'navigation', 'footer'), navigationFooter(), { merge: true });
  console.log('  -> navigation/footer written');
}

async function seedPages(db: Firestore) {
  console.log('[3/7] Seeding pages...');
  const pages = [
    pageHome(),
    pageAbout(),
    pageLocations(),
    pageContact(),
    pageLegalNotice(),
    pagePrivacyPolicy(),
    pageCookiesPolicy(),
  ];
  for (const page of pages) {
    await setDoc(doc(db, 'pages', page.slug), page, { merge: true });
    console.log(`  -> pages/${page.slug} written`);
  }
}

async function seedWhitePapers(db: Firestore) {
  console.log('[8/8] Seeding white_papers...');
  const deleted = await deleteCollection(db, 'white_papers');
  if (deleted > 0) console.log(`  -> deleted ${deleted} existing white_papers`);

  const papers = [
    {
      title: ls('DORA Compliance Guide for Financial Institutions'),
      description: ls('A practical guide to achieving Digital Operational Resilience Act compliance: scope, requirements, timelines, and how COIN AS can help your organisation meet the January 2025 deadline.'),
      category: 'regulatory',
      fileUrl: '',
      thumbnailUrl: null,
      pages: 24,
      published: true,
      publishedAt: new Date('2024-11-01'),
      downloadCount: 0,
      tags: ['DORA', 'NIS2', 'Financial', 'Compliance'],
    },
    {
      title: ls('Business Continuity Planning: A Step-by-Step Guide'),
      description: ls('From risk assessment to BCP testing. A comprehensive methodology guide for Business Continuity Managers based on 20 years of BeNeLux experience.'),
      category: 'business_continuity',
      fileUrl: '',
      thumbnailUrl: null,
      pages: 36,
      published: true,
      publishedAt: new Date('2024-09-15'),
      downloadCount: 0,
      tags: ['BCP', 'Methodology', 'Risk Assessment'],
    },
    {
      title: ls('Ransomware Recovery Playbook'),
      description: ls('When ransomware strikes, every minute counts. This playbook covers the first 72 hours: isolation, assessment, recovery options, and how COIN AS Secure COIN Keys can restore operations without paying the ransom.'),
      category: 'cyber_resilience',
      fileUrl: '',
      thumbnailUrl: null,
      pages: 18,
      published: true,
      publishedAt: new Date('2025-01-10'),
      downloadCount: 0,
      tags: ['Ransomware', 'Cyber', 'Recovery', 'COIN Key'],
    },
    {
      title: ls('Business Continuity for the Financial Sector in Luxembourg'),
      description: ls('Regulatory overview and practical guidance for Luxembourg-based financial institutions: CSSF requirements, DORA, and how dual-site resilience centres in Münsbach and Contern protect your operations.'),
      category: 'case_study',
      fileUrl: '',
      thumbnailUrl: null,
      pages: 20,
      published: true,
      publishedAt: new Date('2025-02-01'),
      downloadCount: 0,
      tags: ['Luxembourg', 'CSSF', 'Finance', 'Recovery'],
    },
  ];

  for (const paper of papers) {
    const ref = await addDoc(collection(db, 'white_papers'), { ...paper, ...ts() });
    console.log(`  -> white_papers/${ref.id} written (${paper.title.en})`);
  }
}

async function seedArticles(db: Firestore) {
  console.log('[9/9] Seeding articles...');
  const deleted = await deleteCollection(db, 'articles');
  if (deleted > 0) console.log(`  -> deleted ${deleted} existing articles`);

  const articles = [
    {
      title: ls('Yearly Business Continuity Exercise - more than a compliance requirement'),
      slug: { en: 'yearly-business-continuity-exercise', fr: '', nl: '' },
      category: 'resource' as const,
      excerpt: ls('Just as you repeat fire evacuation drills every year, disaster management scenarios must also be practised annually. Regular testing is the only way to ensure your organisation is prepared to address unpredictable events and resume operations as fast as possible.'),
      content: ls(`Just as you repeat fire evacuation drills every year, disaster management scenarios must also be practised annually. It is of course more complex because you must test all procedures and means required to get back to business in case of disaster.

The regular testing is the only way to get your organization as prepared as possible to address unpredictable events and resume operations as fast as possible. In every organization, large or small, many changes happen over a 12 months period, if not faster:

- People who had been trained leave the organization and new employees and managers need to be trained. Roles and responsibilities change, if not full departments or business units and communication lines in case of crisis must be updated, documented and tested.
- Process and procedures don't stay static nor your supply chain or logistics, which also calls for updating and testing collaboration with third parties.
- And of course, your IT environment has gone through multiple changes like the software updates, new applications, telecom and services providers contracts.

Your business continuity manager will address these changes in the updated business continuity plan, but you must ensure that these updates work in practice and that people are sufficiently familiar with their implementation.

Some points to consider to perform the business continuity exercise:

- How many scenarios and which one should be tested next time?
- What level of disruption to the daily business can the exercise itself cause?
- Do you perform it with your production systems and site, or at a training center?
- How many and which employees, suppliers, customers should be involved?
- Who should be trained and informed beforehand and who "got the surprise"?
- Can the same person organize and run the exercise, provide guidance, monitor the progress and identify discrepancies with the BCP and improvement points?

COIN experts are ready to help review your BCP training scenario and to assist running it.

## COIN Services for Business Continuity Exercises

### Consultancy Services
- Consultancy services for design and performance of the yearly exercise
- Independent monitoring of the exercise versus contingency plan
- "Troublemaker" or injections of disrupting scenario points during the exercise

### Training Center
Our business continuity and crisis management center are the ideal location to perform your yearly BCP exercise, even if you don't actually intend to use our site in case of disaster. The site are equipped with all necessary facilities to and systems to run multiple scenarios and staffed with experienced manager who can provide the required assistance.`),
      author: 'COIN AS',
      tags: ['business-continuity', 'testing', 'training', 'compliance', 'exercise'],
      published: true,
      publishedAt: new Date('2025-03-15'),
      imageUrl: '/images/coin/coin-fotosharonwillems-36.webp',
    },
    {
      title: ls('Customer success: Relocation of a Disaster Recovery Site in 3 months'),
      slug: { en: 'relocation-disaster-recovery-site', fr: '', nl: '' },
      category: 'case_study' as const,
      excerpt: ls('A regulated customer was required by the regulator to relocate its disaster recovery site further away from its main operation and control room. COIN found and built a new highly resilient site in 3 months.'),
      content: ls(`## The customer challenge

The regulatory authority required our customer to relocate its disaster recovery site further away from its main operation and control room. The deadline was tight, the requirements were strict, and any disruption to the existing operations was out of the question.

## The COIN solution

Find and build, in 3 months, a new highly resilient and secured site.

### Site selection

- Easily reachable and conveniently situated
- At the right distance, out of the disaster prone zones (flooding, electricity grid loops, demonstrations, terrorist or war targets)
- High availability and redundant infrastructure: multiple road access, power generator, dual power lines

### Access and security

- Autonomous but highly secured access control
- Capacity to allow entry of 50 persons in 10 minutes
- Individual badging, full audit logs

### Crisis management facilities

- Dedicated, fully equipped room for crisis management meetings
- Separated manager room for executive coordination

### Workplaces for 24x7 operations

- High availability workplaces designed for 24x7 operations in 3 shifts
- Sit-stand desks, ergonomic chairs, rest area, lunch area, kitchen
- Thin clients, dual screens, phones, dealing turrets, printers, video conferencing systems
- LAN and WiFi throughout

### Resilient infrastructure

- Redundant Internet, LAN, cabling and UPS
- 1 power circuit per desk
- 3 UTP cables per desk
- Ready in 1 hour, with 24x7 remote and onsite support in case of contingency

## Compliance with regulatory requirements

- Health and safety, fire prevention, full site certification
- Documentation of site guides, access procedures and contingency plan
- Testing and evidence of compliance with technical specifications and regulation
- Monthly testing of infrastructure
- Bi-annual disaster recovery exercise

## The result

A fully operational, regulator-compliant disaster recovery site delivered in 3 months. The customer met the regulatory deadline without disrupting its main operations, and now operates from a more resilient infrastructure than before the move.`),
      author: 'COIN AS',
      tags: ['case-study', 'disaster-recovery', 'regulatory', 'dedicated-site'],
      published: true,
      publishedAt: new Date('2025-06-10'),
      imageUrl: '/images/coin/coin-luxembourg-contern-disaster-recovery-office-big.webp',
    },
  ];

  for (const article of articles) {
    const ref = await addDoc(collection(db, 'articles'), { ...article, ...ts() });
    console.log(`  -> articles/${ref.id} written (${article.title.en})`);
  }
}

async function seedServices(db: Firestore) {
  console.log('[4/7] Seeding services...');
  const services = servicesData();
  for (const svc of services) {
    const data = { ...svc, published: true, ...ts() };
    await setDoc(doc(db, 'services', svc.slug), data, { merge: true });
    console.log(`  -> services/${svc.slug} written`);
  }
}

async function deleteCollection(db: Firestore, collectionName: string) {
  const snapshot = await getDocs(collection(db, collectionName));
  for (const d of snapshot.docs) {
    await deleteDoc(d.ref);
  }
  return snapshot.size;
}

async function seedTestimonials(db: Firestore) {
  console.log('[5/7] Seeding testimonials...');
  const deleted = await deleteCollection(db, 'testimonials');
  if (deleted > 0) console.log(`  -> deleted ${deleted} existing testimonials`);

  const items = testimonialsData();
  for (const item of items) {
    const ref = await addDoc(collection(db, 'testimonials'), { ...item, ...ts() });
    console.log(`  -> testimonials/${ref.id} written (${item.authorName})`);
  }
}

async function seedTeamMembers(db: Firestore) {
  console.log('[6/7] Seeding team_members...');
  const deleted = await deleteCollection(db, 'team_members');
  if (deleted > 0) console.log(`  -> deleted ${deleted} existing team_members`);

  const items = teamMembersData();
  for (const item of items) {
    const ref = await addDoc(collection(db, 'team_members'), { ...item, ...ts() });
    console.log(`  -> team_members/${ref.id} written (${item.name})`);
  }
}

async function seedPartners(db: Firestore) {
  console.log('[7/7] Seeding partners...');
  const deleted = await deleteCollection(db, 'partners');
  if (deleted > 0) console.log(`  -> deleted ${deleted} existing partners`);

  const items = partnersData();
  for (const item of items) {
    const ref = await addDoc(collection(db, 'partners'), { ...item, ...ts() });
    console.log(`  -> partners/${ref.id} written (${item.name})`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== COIN Firestore Seed Script ===');
  console.log('Project: coin-website-8d592');
  console.log('');

  const db = getFirestore();

  await seedSiteConfig(db);
  await seedNavigation(db);
  await seedPages(db);
  await seedServices(db);
  await seedTestimonials(db);
  await seedTeamMembers(db);
  await seedPartners(db);
  await seedWhitePapers(db);
  await seedArticles(db);

  console.log('');
  console.log('=== Seeding complete ===');
  console.log('Collections seeded: site_config, navigation, pages, services, testimonials, team_members, partners, white_papers, articles');
  // Force exit since Firebase client SDK keeps connections open
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
