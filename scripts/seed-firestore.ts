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
    tagline: ls('For over 20 years dedicated to business continuity in the BeNeLux'),
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
      'COIN is a leading business continuity service provider in the BeNeLux, offering consulting, training, business continuity centres, and cyberresilience solutions.',
    ),
    copyright: ls('All rights reserved.'),
    ...ts(),
  };
}

function navigationMain() {
  return {
    items: [
      {
        label: ls('Services'),
        path: '/services',
        order: 0,
        children: [
          { label: ls('Consulting & Training'), path: '/services/consultancy', order: 0 },
          { label: ls('Business Continuity Centres'), path: '/services/business-continuity', order: 1 },
          { label: ls('Cyber Resilience Solutions'), path: '/services/cyber-resilience', order: 2 },
          { label: ls('Dedicated Recovery Sites'), path: '/services/recovery-workplaces', order: 3 },
          { label: ls('Satellite Offices & Co-location'), path: '/services/satellite-offices', order: 4 },
        ],
      },
      {
        label: ls('Ressources'),
        path: '/knowledge-hub',
        order: 1,
        children: [
          { label: ls('Articles'), path: '/knowledge-hub', order: 0 },
          { label: ls('News & Events'), path: '/news', order: 1 },
          { label: ls('Case Studies'), path: '/knowledge-hub?category=case_study', order: 2 },
          { label: ls('FAQ'), path: '/knowledge-hub/faq', order: 3 },
        ],
      },
      {
        label: ls('About Us'),
        path: '/about',
        order: 2,
        children: [
          { label: ls('Our Mission'), path: '/about#mission', order: 0 },
          { label: ls('Our Values'), path: '/about#values', order: 1 },
          { label: ls('Our Experts'), path: '/about#teams', order: 2 },
          { label: ls('Partners'), path: '/partners', order: 3 },
          { label: ls('Customers / References'), path: '/about#customers', order: 4 },
          { label: ls('History'), path: '/about#history', order: 5 },
        ],
      },
      { label: ls('Contact'), path: '/contact', order: 3, children: null },
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
          { label: ls('Partners'), path: '/partners' },
          { label: ls('Customers / References'), path: '/about#customers' },
          { label: ls('History'), path: '/about#history' },
          { label: ls('Locations'), path: '/locations' },
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
      metaTitle: ls('COIN - Business Continuity Innovation'),
      metaDescription: ls(
        'Test your business continuity plan with COIN. Over 20 years dedicated to business continuity in the BeNeLux.',
      ),
      ogImage: null,
    },
    sections: [
      {
        type: 'hero',
        order: 0,
        heading: ls('Test your business continuity plan with COIN'),
        bulletPoints: [
          ls('COIN experts help you prepare and organise your exercise'),
          ls('Our business continuity centres host 100+ exercises every year'),
          ls('Use COIN recovery office facilities and crisis management rooms'),
          ls('Service also available for organisation with their own disaster site'),
          ls('Insightful learnings and better preparation in case of real disaster'),
        ],
        primaryButtonText: ls('Contact us'),
        primaryButtonLink: '/contact',
        secondaryButtonText: ls('Read more about continuity test and training'),
        secondaryButtonLink: '/services/training',
        backgroundImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80',
      },
      {
        type: 'service_pillars',
        order: 1,
        heading: ls('20 years of innovation in business continuity'),
        subtitle: ls(
          'COIN is a leader in the BeNeLux for business continuity and crisis management services. Our teams enable organisations for which continuity of operations is vital, to respond to crisis and business disrupting events with flexible and proven solutions.',
        ),
        ctaText: ls('Discover our solutions'),
        pillars: [
          {
            title: ls('Consulting & Training'),
            description: ls(
              'Pragmatic, field proven advices, tests and training services for risks analysis, crisis management, disaster response and recovery.',
            ),
            tagline: ls('Prepare your teams for any crisis'),
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
            link: '/services/consultancy',
          },
          {
            title: ls('Business Continuity Centres'),
            description: ls(
              'Fully equipped and resilient centres with facilities for crisis management, recovery offices, call centres... Build & operation of dedicated sites.',
            ),
            tagline: ls('Keep working, whatever happens'),
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
            link: '/services/recovery-workplaces',
          },
          {
            title: ls('Cyberresilience Solutions'),
            description: ls(
              'Awareness, Co-location, alternate workstations, immutable backup, and clean tenants to respond to cyberincidents and ICT outages.',
            ),
            tagline: ls('Stay ahead of cyber threats'),
            imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
            link: '/services/cyber-resilience',
          },
        ],
      },
      {
        type: 'innovation',
        order: 2,
        heading: ls('Innovation in Business Continuity'),
        body: ls(
          'COIN has over 20 years of experience in business continuity. Yet, each year brings its share of new risks as well as technological challenges and opportunities. Together with our partners, we continuously develop innovative and robust solutions that improve the resiliency of our customers in an increasingly complex business and regulatory environment.',
        ),
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      },
      {
        type: 'flexible_services',
        order: 3,
        heading: ls('Flexible Services - Customized SLA'),
        body: ls(
          'COIN adjusts to your needs and constraints. We know business continuity objectives and regulatory requirements depend on your business, country, and resources available in your organisation. We can offer this unique level of flexibility because business continuity is our core business and we have experience with 300+ customers in various industries.',
        ),
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      },
      {
        type: 'mission_statement',
        order: 4,
        heading: ls('Your business continuity is our mission'),
        body: ls(
          "COIN teams know exactly what it means for customers with critical operations to be stricken by disrupting events such as loss of telecom line, power cuts, ransomware or pandemics. Our experts will be your first line of defence to prevent unforeseen events to disrupt your business and they are committed to be your last line of defence when you'll need to resort to contingency measures and call upon COIN's business continuity services.",
        ),
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
      },
      {
        type: 'stats',
        order: 5,
        stats: [
          { value: 20, suffix: '+', label: ls('Years of Experience') },
          { value: 300, suffix: '+', label: ls('Customers') },
          { value: 99.9, suffix: '%', label: ls('SLA Uptime') },
          { value: 3, suffix: '', label: ls('Countries') },
        ],
      },
      {
        type: 'testimonials_ref',
        order: 6,
        heading: ls('What our clients say'),
      },
      {
        type: 'cta_banner',
        order: 7,
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
      metaTitle: ls('About COIN - Business Continuity Experts'),
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
        backgroundImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
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
        imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
      },
      {
        type: 'values',
        order: 2,
        heading: ls('Our Values'),
        imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
        values: [
          { title: ls('Expertise'), description: ls('Over 20 years of hands-on experience in business continuity management, crisis response, and cyber resilience across the BeNeLux.') },
          { title: ls('Reliability'), description: ls('We deliver on our promises with 99.9% SLA uptime and round-the-clock support when our customers need it most.') },
          { title: ls('Innovation'), description: ls('We continuously invest in cutting-edge technology and methodologies to stay ahead of evolving threats and disruptions.') },
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
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      },
      {
        type: 'partners_preview',
        order: 4,
        heading: ls('Our Partners'),
        body: ls(
          'Maintaining business resiliency is an increasingly difficult challenge that requires to guarantee the availability and access to many human and technical resources. COIN and its partners comprehend each other with their skills and resources to enable the highest possible level of business continuity of the organisations that rely on us. Together we cover the many disrupting events and recovery scenarios for natural disaster, cyber attacks and other crisis situations.',
        ),
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
        ctaLink: '/partners',
        ctaButtonText: ls('View all partners'),
      },
      {
        type: 'customers',
        order: 5,
        heading: ls('Our Customers'),
        body: ls(
          'COIN customers are in industries in which time of the essence and operational resilience is a business necessity, regardless of the size of their organisation. Our customers are as banks, insurances, utilities, hospitals, emergency and rescue services, call centres or operation rooms and many of them must comply with regulatory frameworks such as NIS2, DORA or local regulation that impose alternate recovery sites or cyberesilience prevention and response measures.\n\nCOIN provides services to more than 250 organisations ranging from 10 employees up to 2,000 in Belgium, The Netherlands and Luxembourg.',
        ),
        imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
        logoUrls: [],
      },
      {
        type: 'timeline',
        order: 6,
        heading: ls('Our History'),
        events: [
          {
            year: '2003',
            title: ls('COIN Founded'),
            description: ls(
              'COIN was established in the Netherlands, providing business continuity services to the Dutch market.',
            ),
          },
          {
            year: '2010',
            title: ls('Expansion to Belgium'),
            description: ls(
              'COIN expanded its services to Belgium, establishing a presence in Brussels.',
            ),
          },
          {
            year: '2015',
            title: ls('Schiphol-Rijk HQ'),
            description: ls(
              'COIN moved its headquarters to Schiphol-Rijk, a strategic location near Amsterdam Airport.',
            ),
          },
          {
            year: '2022',
            title: ls('Sungard AS Integration'),
            description: ls(
              "Integration of Sungard Availability Services' BeNeLux operations, strengthening our recovery capabilities.",
            ),
          },
          {
            year: '2024',
            title: ls('ISO 27001 Certification'),
            description: ls(
              'COIN achieved ISO 27001 certification, demonstrating our commitment to information security.',
            ),
          },
          {
            year: '2025',
            title: ls('New Belgium Site'),
            description: ls(
              'Opening of a new business continuity centre in Belgium to better serve our Benelux customers.',
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
      metaTitle: ls('COIN Locations - Business Continuity Centres'),
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
        backgroundImageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1920&q=80',
      },
      {
        type: 'map_overview',
        order: 1,
        body: ls(
          'COIN offers business continuity services in The Netherlands, Luxembourg and Belgium and is the only business continuity specialist providing consistent level of services across the BeNeLux. The services are delivered at COIN business centers and at customer premises.\n\nCOIN operates 2 redundant shared business continuity sites in Luxembourg, one shared site near Amsterdam, as well as a customer dedicated site in Belgium.\n\nEach shared site features a crisis management room, single customer dedicated recovery offices and multi-customers rooms with a range of facility and IT options. Each site is equipped with high resilient power and IT systems, multiple telecom service provider access, as well as physical and digital security solutions and processes compliant with ISO 27001.',
        ),
        mapImageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80',
        isoBadgeUrl: null,
      },
      {
        type: 'room_types',
        order: 2,
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
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
            imageUrl:
              'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
            description: ls(
              'Our headquarters and primary business continuity centre, strategically located near Amsterdam Airport Schiphol. The facility offers dedicated and shared recovery rooms, a crisis management suite, and co-location services.',
            ),
          },
          {
            name: ls('Munsbach'),
            country: ls('Luxembourg'),
            imageUrl:
              'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
            description: ls(
              'Our Luxembourg facility in Munsbach serves the financial services sector and provides dedicated recovery environments tailored to the specific regulatory requirements of the Grand Duchy.',
            ),
          },
          {
            name: ls('Contern'),
            country: ls('Luxembourg'),
            imageUrl:
              'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
            description: ls(
              'Our newest site in Contern, Luxembourg, offering state-of-the-art recovery facilities and additional capacity to serve growing demand in the Luxembourg market.',
            ),
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
      metaTitle: ls('Contact COIN'),
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
          'COIN services customers in Luxembourg, The Netherlands and Belgium',
        ),
        phones: [
          { label: ls('Nederlands, English'), number: '+31 88 26 46 000' },
          { label: ls('Francais, Deutsch, English'), number: '+352 357 05 30' },
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
      heroImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
      overview: ls('COIN offers a complete range of business continuity services...'),
      sections: [
        {
          type: 'rich_text',
          order: 0,
          heading: ls('Complete Business Continuity Solutions'),
          body: ls(
            'From consulting and training to state-of-the-art recovery facilities and cyberresilience solutions, COIN provides everything you need to ensure your organisation can continue operating during any disruption.',
          ),
        },
      ],
    },
    {
      slug: 'business-continuity',
      title: ls('Business Continuity'),
      shortTitle: ls('Business Continuity'),
      category: 'consulting',
      order: 1,
      heroSubtitle: ls('Ensure your organisation can continue operating during any disruption'),
      heroImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
      overview: ls(
        'Business continuity planning is essential for any organisation. COIN helps you develop, test, and maintain comprehensive business continuity plans that ensure your critical operations can continue during and after a disruption.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Key Components'),
          features: [
            {
              title: ls('Business Impact Analysis'),
              description: ls(
                'Identify your critical business processes and the impact of their disruption.',
              ),
            },
            {
              title: ls('Recovery Strategy'),
              description: ls(
                'Develop strategies to recover critical processes within acceptable timeframes.',
              ),
            },
            {
              title: ls('Plan Development'),
              description: ls(
                'Create detailed business continuity plans with clear procedures and responsibilities.',
              ),
            },
            {
              title: ls('Testing & Exercising'),
              description: ls(
                'Regular testing and exercises to ensure plans are effective and teams are prepared.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'crisis-management',
      title: ls('Crisis Management'),
      shortTitle: ls('Crisis Management'),
      category: 'consulting',
      order: 2,
      heroSubtitle: ls('Prepare your organisation to respond effectively to any crisis'),
      heroImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
      overview: ls(
        'Effective crisis management requires preparation, training, and the right tools. COIN provides comprehensive crisis management services including crisis plans, communication strategies, and simulation exercises.',
      ),
      sections: [
        {
          type: 'rich_text',
          order: 0,
          heading: ls('Crisis Management'),
          body: ls(
            'Effective crisis management requires preparation, training, and the right tools. COIN provides comprehensive crisis management services including crisis plans, communication strategies, and simulation exercises.',
          ),
        },
      ],
    },
    {
      slug: 'cyber-resilience',
      title: ls('Cyberresilience Solutions'),
      shortTitle: ls('Cyberresilience'),
      category: 'cyber',
      order: 3,
      heroSubtitle: ls(
        'Protect your organisation against cyber threats and ensure rapid recovery',
      ),
      heroImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
      overview: ls(
        "In today's digital landscape, cyber resilience is critical. COIN's cyberresilience solutions combine prevention, detection, response, and recovery capabilities to protect your organisation against evolving cyber threats.",
      ),
      sections: [
        {
          type: 'rich_text',
          order: 0,
          heading: ls('Cyberresilience Solutions'),
          body: ls(
            "In today's digital landscape, cyber resilience is critical. COIN's cyberresilience solutions combine prevention, detection, response, and recovery capabilities to protect your organisation against evolving cyber threats.",
          ),
        },
      ],
    },
    {
      slug: 'recovery-workplaces',
      title: ls('Recovery Workplaces'),
      shortTitle: ls('Recovery Workplaces'),
      category: 'centers',
      order: 4,
      heroSubtitle: ls('Fully equipped workspaces ready for your team when disaster strikes'),
      heroImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
      overview: ls(
        "COIN's recovery workplaces provide fully equipped office environments that can be activated within hours. Located across the BeNeLux, our facilities ensure your teams can continue working during any disruption.",
      ),
      sections: [
        {
          type: 'rich_text',
          order: 0,
          heading: ls('Recovery Workplaces'),
          body: ls(
            "COIN's recovery workplaces provide fully equipped office environments that can be activated within hours. Located across the BeNeLux, our facilities ensure your teams can continue working during any disruption.",
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
      heroSubtitle: ls('Flexible satellite office solutions for distributed work continuity'),
      heroImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
      overview: ls(
        "COIN's satellite office solutions provide flexible workspace options across the BeNeLux, enabling your teams to work from secure, equipped locations close to their homes during a disruption.",
      ),
      sections: [
        {
          type: 'rich_text',
          order: 0,
          heading: ls('Satellite Offices'),
          body: ls(
            "COIN's satellite office solutions provide flexible workspace options across the BeNeLux, enabling your teams to work from secure, equipped locations close to their homes during a disruption.",
          ),
        },
      ],
    },
    {
      slug: 'virtual-workplaces',
      title: ls('Virtual Workplaces'),
      shortTitle: ls('Virtual Workplaces'),
      category: 'centers',
      order: 6,
      heroSubtitle: ls('Cloud-based virtual desktop infrastructure for remote continuity'),
      heroImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
      overview: ls(
        "COIN's virtual workplace solutions provide secure, cloud-based desktop environments that enable your teams to work from anywhere. Our VDI platform ensures business continuity without physical relocation.",
      ),
      sections: [
        {
          type: 'rich_text',
          order: 0,
          heading: ls('Virtual Workplaces'),
          body: ls(
            "COIN's virtual workplace solutions provide secure, cloud-based desktop environments that enable your teams to work from anywhere. Our VDI platform ensures business continuity without physical relocation.",
          ),
        },
      ],
    },
    {
      slug: 'co-location',
      title: ls('Co-location Services'),
      shortTitle: ls('Co-location'),
      category: 'centers',
      order: 7,
      heroSubtitle: ls('Secure hosting for your critical IT infrastructure'),
      heroImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
      overview: ls(
        "COIN's co-location services provide secure, resilient hosting for your critical IT systems. Our data centres offer redundant power, cooling, and connectivity to ensure your infrastructure is always available.",
      ),
      sections: [
        {
          type: 'rich_text',
          order: 0,
          heading: ls('Co-location Services'),
          body: ls(
            "COIN's co-location services provide secure, resilient hosting for your critical IT systems. Our data centres offer redundant power, cooling, and connectivity to ensure your infrastructure is always available.",
          ),
        },
      ],
    },
    {
      slug: 'nis2-dora',
      title: ls('NIS2 & DORA Compliance'),
      shortTitle: ls('NIS2 & DORA'),
      category: 'consulting',
      order: 8,
      heroSubtitle: ls('Navigate regulatory requirements with confidence'),
      heroImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
      overview: ls(
        'The NIS2 Directive and DORA regulation introduce new requirements for business continuity and cyber resilience. COIN helps you understand these regulations and implement the necessary measures to achieve compliance.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Compliance Services'),
          features: [
            {
              title: ls('Gap Analysis'),
              description: ls(
                'Assess your current position against NIS2 and DORA requirements.',
              ),
            },
            {
              title: ls('Roadmap Development'),
              description: ls(
                'Create a practical roadmap to achieve and maintain compliance.',
              ),
            },
            {
              title: ls('Implementation Support'),
              description: ls(
                'Expert guidance through the implementation of required measures.',
              ),
            },
            {
              title: ls('Audit Preparation'),
              description: ls(
                'Prepare for regulatory audits with comprehensive documentation.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'consultancy',
      title: ls('Consultancy'),
      shortTitle: ls('Consultancy'),
      category: 'consulting',
      order: 9,
      heroSubtitle: ls('Expert consulting for business continuity management'),
      heroImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
      overview: ls(
        "COIN's consultancy services help organisations develop and maintain effective business continuity management systems. Our experienced consultants work with you to assess risks, develop strategies, and build organisational resilience.",
      ),
      sections: [
        {
          type: 'rich_text',
          order: 0,
          heading: ls('Consultancy'),
          body: ls(
            "COIN's consultancy services help organisations develop and maintain effective business continuity management systems. Our experienced consultants work with you to assess risks, develop strategies, and build organisational resilience.",
          ),
        },
      ],
    },
    {
      slug: 'training',
      title: ls('Training'),
      shortTitle: ls('Training'),
      category: 'consulting',
      order: 10,
      heroSubtitle: ls('Build competence and confidence in business continuity'),
      heroImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
      overview: ls(
        'COIN offers a comprehensive range of training programmes for business continuity professionals. From awareness sessions to advanced crisis simulation exercises, we help your teams develop the skills they need.',
      ),
      sections: [
        {
          type: 'features_list',
          order: 0,
          heading: ls('Training Programmes'),
          features: [
            {
              title: ls('BC Awareness'),
              description: ls(
                'Introduction to business continuity concepts for all staff.',
              ),
            },
            {
              title: ls('Crisis Simulation'),
              description: ls(
                "Realistic crisis scenarios to test your team's response capabilities.",
              ),
            },
            {
              title: ls('BC Professional'),
              description: ls(
                'In-depth training for business continuity professionals and coordinators.',
              ),
            },
            {
              title: ls('Tabletop Exercises'),
              description: ls(
                'Structured discussion-based exercises to validate plans and procedures.',
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
        "The migration to COIN's SOC & SIEM solution went seamlessly. Their team perfectly understood our specific needs as a healthcare institution and adapted their solution accordingly.",
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

  console.log('');
  console.log('=== Seeding complete ===');
  console.log('Collections seeded: site_config, navigation, pages, services, testimonials, team_members, partners');
  // Force exit since Firebase client SDK keeps connections open
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
