/**
 * Migrate the service_pillars section in pages/home from the old shape
 * (heading / subtitle / ctaText / pillars[]) to the new shape
 * (stepsHeading / steps[] / solutionsHeading / solutions[]).
 *
 * Usage:
 *   npm run migrate-service-pillars              # dry-run
 *   npm run migrate-service-pillars -- --apply   # write
 *
 * Idempotent: if the section is already on the new shape (has `steps` or
 * `solutions`), the script reports "already migrated" and does nothing.
 *
 * Auth: reads .firebase-target-sa.json by default (TARGET_SERVICE_ACCOUNT
 * to override), or FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY env vars.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { readFileSync, existsSync } from 'node:fs'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const APPLY = process.argv.includes('--apply')

const ls = (en: string) => ({ en, fr: '', nl: '' })

const STEPS_HEADING = ls(
  'Your business continuity is our mission, from risk assessment to recovery',
)

const STEPS = [
  {
    name: ls('ASSESS'),
    subtitle: ls('Identify your risks and disruption scenarios'),
    description: ls(
      'We analyse your business processes, regulatory obligations and define the right business continuity strategy.',
    ),
  },
  {
    name: ls('PREPARE'),
    subtitle: ls('Prepare for disruption and reduce their impacts'),
    description: ls(
      'From natural disaster to human caused incidents or phishing, we help you to prevent and get you ready and trained to manage the crisis and minimize its impact.',
    ),
  },
  {
    name: ls('RESPOND'),
    subtitle: ls('Continue to work and resume operations in case of disruption.'),
    description: ls(
      'We provide secure environments, physical and digital recovery solutions and crisis support.',
    ),
  },
]

const SOLUTIONS_HEADING = ls('Our solutions')

const SOLUTIONS = [
  {
    title: ls('Consultancy & Training'),
    description: ls(
      'Business Impact Analysis, Continuity Plans, Crisis Management and Disaster Simulation Exercices.',
    ),
    href: '/services/consultancy-and-training',
  },
  {
    title: ls('Recovery Workplaces'),
    description: ls(
      '24x7 available fully equipped offices to resume operations within hours, or for special projects.',
    ),
    href: '/services/recovery-workplaces',
  },
  {
    title: ls('Crisis Management'),
    description: ls(
      'Prepare for and manage crisis with expert support, crisis management facilities and war rooms.',
    ),
    href: '/services/crisis-management',
  },
  {
    title: ls('IT Housing'),
    description: ls(
      'Secure and resilient DRP hosting in Luxembourg with co-located recovery offices.',
    ),
    href: '/services/it-housing',
  },
  {
    title: ls('Cyber Resilience'),
    description: ls(
      'Prevent phishing attacks, Clean Azure tenant, recovery laptops, and recovery USB keys.',
    ),
    href: '/services/cyberresilience',
  },
]

function loadCredentials(): { projectId: string; clientEmail: string; privateKey: string } {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }
  const saPath = process.env.TARGET_SERVICE_ACCOUNT ?? '.firebase-target-sa.json'
  if (!existsSync(saPath)) {
    throw new Error(`No credentials. Provide ${saPath} or set FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.`)
  }
  const sa = JSON.parse(readFileSync(saPath, 'utf8')) as {
    project_id: string
    client_email: string
    private_key: string
  }
  return { projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key }
}

interface Section {
  type?: string
  order?: number
  // legacy fields:
  heading?: unknown
  subtitle?: unknown
  ctaText?: unknown
  pillars?: unknown
  // new fields:
  stepsHeading?: unknown
  steps?: unknown[]
  solutionsHeading?: unknown
  solutions?: unknown[]
}

async function main() {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadCredentials()) })
  }
  const db = getFirestore()

  const docRef = db.collection('pages').doc('home')
  const snap = await docRef.get()
  if (!snap.exists) {
    console.error('pages/home document not found.')
    process.exit(1)
  }
  const data = snap.data() as { sections?: Section[] }
  const sections = data.sections ?? []
  const idx = sections.findIndex((s) => s.type === 'service_pillars')
  if (idx === -1) {
    console.error('No service_pillars section in pages/home.')
    process.exit(1)
  }

  const current = sections[idx]
  const alreadyMigrated =
    Array.isArray(current.steps) &&
    current.steps.length > 0 &&
    Array.isArray(current.solutions) &&
    current.solutions.length > 0
  if (alreadyMigrated) {
    console.log('Section is already on the new shape. Nothing to do.')
    return
  }

  console.log(`Found service_pillars at sections[${idx}].`)
  console.log('Old fields present:', {
    heading: 'heading' in current,
    subtitle: 'subtitle' in current,
    ctaText: 'ctaText' in current,
    pillars: 'pillars' in current,
  })
  console.log('New fields present:', {
    stepsHeading: 'stepsHeading' in current,
    steps: Array.isArray(current.steps) ? current.steps.length : 0,
    solutionsHeading: 'solutionsHeading' in current,
    solutions: Array.isArray(current.solutions) ? current.solutions.length : 0,
  })

  const next: Section = {
    type: 'service_pillars',
    order: current.order ?? 0,
    stepsHeading: STEPS_HEADING,
    steps: STEPS,
    solutionsHeading: SOLUTIONS_HEADING,
    solutions: SOLUTIONS,
  }

  const newSections = [...sections]
  newSections[idx] = next

  if (!APPLY) {
    console.log('\n(dry-run) Would write:')
    console.log(JSON.stringify(next, null, 2))
    console.log('\nPass --apply to persist.')
    return
  }

  await docRef.update({ sections: newSections, updatedAt: Timestamp.now() })
  console.log('Migrated.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
