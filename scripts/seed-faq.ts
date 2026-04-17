import { config } from 'dotenv'
config({ path: '.env.local' })
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

type LocaleString = { en: string; fr: string; nl: string }
function faq(en: string, fr: string, nl: string): LocaleString {
  return { en, fr, nl }
}

// Preserved verbatim from the original hardcoded content of
// src/app/(marketing)/knowledge-hub/faq/page.tsx
const faqItems = [
  {
    question: faq(
      'What is business continuity?',
      'Qu\'est-ce que la continuite des activites ?',
      'Wat is bedrijfscontinuiteit?'
    ),
    answer: faq(
      'Business continuity is the capability of an organization to continue delivering products or services at acceptable predefined levels following a disruptive incident. It encompasses planning, preparation, and processes that ensure critical business functions can continue during and after a disaster or disruption.',
      'La continuite des activites est la capacite d\'une organisation a continuer de fournir des produits ou services a des niveaux predefinies acceptables apres un incident perturbateur. Elle englobe la planification, la preparation et les processus qui garantissent que les fonctions critiques de l\'entreprise puissent continuer pendant et apres une catastrophe ou une perturbation.',
      'Bedrijfscontinuiteit is het vermogen van een organisatie om producten of diensten te blijven leveren op vooraf bepaalde aanvaardbare niveaus na een verstorend incident. Het omvat planning, voorbereiding en processen die ervoor zorgen dat kritieke bedrijfsfuncties kunnen doorgaan tijdens en na een ramp of verstoring.'
    ),
    category: 'general',
  },
  {
    question: faq(
      'Why do I need a business continuity plan?',
      'Pourquoi ai-je besoin d\'un plan de continuite des activites ?',
      'Waarom heb ik een bedrijfscontinuiteitsplan nodig?'
    ),
    answer: faq(
      'A business continuity plan protects your organization against unexpected disruptions such as cyberattacks, natural disasters, pandemics, or infrastructure failures. Without a plan, downtime can lead to significant financial losses, reputational damage, regulatory penalties, and loss of customer trust. A well-designed BCP ensures faster recovery and minimal impact on operations.',
      'Un plan de continuite des activites protege votre organisation contre les perturbations inattendues telles que les cyberattaques, les catastrophes naturelles, les pandemies ou les defaillances d\'infrastructure. Sans plan, les temps d\'arret peuvent entrainer des pertes financieres importantes, des dommages reputationnels, des sanctions reglementaires et une perte de confiance des clients.',
      'Een bedrijfscontinuiteitsplan beschermt uw organisatie tegen onverwachte verstoringen zoals cyberaanvallen, natuurrampen, pandemieeen of infrastructuurstoringen. Zonder plan kan downtime leiden tot aanzienlijke financiele verliezen, reputatieschade, wettelijke boetes en verlies van klantenvertrouwen.'
    ),
    category: 'general',
  },
  {
    question: faq(
      'What is NIS2?',
      'Qu\'est-ce que NIS2 ?',
      'Wat is NIS2?'
    ),
    answer: faq(
      'NIS2 (Network and Information Security Directive 2) is an EU directive that strengthens cybersecurity requirements across the European Union. It expands the scope of the original NIS directive to cover more sectors and introduces stricter security measures, incident reporting obligations, and significant penalties for non-compliance. Organizations in essential and important sectors must implement appropriate risk management measures.',
      'NIS2 (Directive sur la securite des reseaux et de l\'information 2) est une directive europeenne qui renforce les exigences en matiere de cybersecurite dans l\'Union europeenne. Elle elargit le champ d\'application de la directive NIS originale pour couvrir davantage de secteurs et introduit des mesures de securite plus strictes, des obligations de signalement des incidents et des sanctions significatives en cas de non-conformite.',
      'NIS2 (Netwerk- en Informatiebeveiliging Richtlijn 2) is een EU-richtlijn die de cyberbeveiligingsvereisten in de Europese Unie versterkt. Het breidt het toepassingsgebied van de oorspronkelijke NIS-richtlijn uit naar meer sectoren en introduceert strengere beveiligingsmaatregelen, meldingsplichten voor incidenten en aanzienlijke boetes bij niet-naleving.'
    ),
    category: 'compliance',
  },
  {
    question: faq(
      'What is DORA?',
      'Qu\'est-ce que DORA ?',
      'Wat is DORA?'
    ),
    answer: faq(
      'DORA (Digital Operational Resilience Act) is an EU regulation that establishes a uniform framework for managing ICT risks in the financial sector. It requires financial entities to implement robust ICT risk management, conduct regular testing, manage third-party ICT risks, and report major ICT-related incidents. DORA ensures the financial sector can withstand and recover from digital disruptions.',
      'DORA (Digital Operational Resilience Act) est un reglement europeen qui etablit un cadre uniforme pour la gestion des risques TIC dans le secteur financier. Il exige des entites financieres qu\'elles mettent en place une gestion robuste des risques TIC, effectuent des tests reguliers, gerent les risques lies aux prestataires TIC tiers et signalent les incidents majeurs lies aux TIC.',
      'DORA (Digital Operational Resilience Act) is een EU-verordening die een uniform kader vaststelt voor het beheer van ICT-risico\'s in de financiele sector. Het vereist dat financiele entiteiten robuust ICT-risicobeheer implementeren, regelmatige tests uitvoeren, ICT-risico\'s van derden beheren en grote ICT-gerelateerde incidenten melden.'
    ),
    category: 'compliance',
  },
  {
    question: faq(
      'How often should I test my business continuity plan?',
      'A quelle frequence dois-je tester mon plan de continuite des activites ?',
      'Hoe vaak moet ik mijn bedrijfscontinuiteitsplan testen?'
    ),
    answer: faq(
      'Business continuity plans should be tested at least once a year, though best practice recommends quarterly testing of critical components. Testing can range from tabletop exercises and walkthrough drills to full-scale simulations. Regular testing ensures your plan remains effective, staff are trained and prepared, and any gaps or outdated procedures are identified and corrected.',
      'Les plans de continuite des activites doivent etre testes au moins une fois par an, bien que les meilleures pratiques recommandent des tests trimestriels des composants critiques. Les tests peuvent aller d\'exercices sur table et de simulations pas a pas jusqu\'a des simulations a grande echelle. Des tests reguliers garantissent que votre plan reste efficace et que le personnel est forme.',
      'Bedrijfscontinuiteitsplannen moeten minstens een keer per jaar worden getest, hoewel best practices kwartaaltests van kritieke componenten aanbevelen. Testen kunnen varieren van tabletop-oefeningen en walkthrough-drills tot volledige simulaties. Regelmatig testen zorgt ervoor dat uw plan effectief blijft en dat het personeel getraind en voorbereid is.'
    ),
    category: 'general',
  },
  {
    question: faq(
      'What services does COIN offer?',
      'Quels services COIN propose-t-il ?',
      'Welke diensten biedt COIN aan?'
    ),
    answer: faq(
      'COIN offers comprehensive business continuity services including: consulting and advisory services to assess and improve your resilience posture; training programs and certifications for your teams; fully equipped business continuity centres with ready-to-use workspaces; and cyberresilience solutions to protect against and recover from cyber threats. We serve organizations across the BeNeLux region.',
      'COIN propose des services complets de continuite des activites : conseil et accompagnement pour evaluer et ameliorer votre posture de resilience ; programmes de formation et certifications pour vos equipes ; centres de continuite entierement equipes avec des espaces de travail prets a l\'emploi ; et des solutions de cyberresilience pour proteger et recuperer face aux cybermenaces.',
      'COIN biedt uitgebreide bedrijfscontinueiteitsdiensten aan, waaronder: advies- en consultancydiensten om uw weerbaarheid te beoordelen en te verbeteren; opleidingsprogramma\'s en certificeringen voor uw teams; volledig uitgeruste bedrijfscontinuiteitscentra met kant-en-klare werkruimten; en cyberweerbaarheidoplossingen om u te beschermen tegen en te herstellen van cyberdreigingen.'
    ),
    category: 'services',
  },
]

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

async function seed() {
  const db = getAdminDb()
  const col = db.collection('faq_items')

  const existing = await col.limit(1).get()
  if (!existing.empty) {
    console.warn('faq_items collection is not empty. Aborting to avoid double-seeding.')
    process.exit(0)
  }

  const now = Timestamp.now()
  let written = 0
  for (let i = 0; i < faqItems.length; i++) {
    const item = faqItems[i]
    await col.add({
      question: item.question,
      answer: item.answer,
      category: item.category,
      order: i,
      published: true,
      createdAt: now,
      updatedAt: now,
    })
    written++
    console.log(`  Seeded #${i} (${item.category}): ${item.question.en}`)
  }
  console.log(`\nSeed complete: ${written} FAQ items written.`)
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
