import { config } from 'dotenv'
config({ path: '.env.local' })
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { LocaleString } from '../src/lib/types/locale'

const ls = (en: string, fr = '', nl = ''): LocaleString => ({ en, fr, nl })

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

interface StubPage {
  slug: string
  title: LocaleString
  metaTitle: LocaleString
  metaDescription: LocaleString
}

// Default copy lifted from each page's previous hardcoded `metadata`,
// so SEO behaviour is unchanged until an editor tweaks it in admin.
const STUBS: StubPage[] = [
  {
    slug: 'partners',
    title: ls('Partners'),
    metaTitle: ls('Partners'),
    metaDescription: ls(
      'Discover our network of business and technology partners in the business continuity ecosystem.',
    ),
  },
  {
    slug: 'become-partner',
    title: ls('Become a Partner'),
    metaTitle: ls('Become a Partner'),
    metaDescription: ls(
      'Partner with COIN to deliver business continuity solutions across the BeNeLux region.',
    ),
  },
  {
    slug: 'news',
    title: ls('News'),
    metaTitle: ls('News'),
    metaDescription: ls(
      'Stay up to date with the latest news from COIN, your business continuity partner.',
    ),
  },
  {
    slug: 'resources',
    title: ls('Resources'),
    metaTitle: ls('Resources'),
    metaDescription: ls(
      'Articles, case studies, videos and news on business continuity, disaster recovery and cyber resilience.',
    ),
  },
  {
    slug: 'resources-articles',
    title: ls('Articles'),
    metaTitle: ls('Articles'),
    metaDescription: ls(
      'Articles and resources on business continuity, disaster recovery and cyber resilience.',
    ),
  },
  {
    slug: 'resources-faq',
    title: ls('FAQ'),
    metaTitle: ls('FAQ'),
    metaDescription: ls(
      'Frequently asked questions about business continuity, NIS2, DORA, and COIN services.',
    ),
  },
  {
    slug: 'resources-videos',
    title: ls('Videos'),
    metaTitle: ls('Videos'),
    metaDescription: ls(
      'All videos from the COIN Business Continuity YouTube channel, playable directly on the site.',
    ),
  },
  {
    slug: 'challenges',
    title: ls('Business Continuity Challenges'),
    metaTitle: ls('Business Continuity Challenges'),
    metaDescription: ls(
      'Every sector faces unique business continuity challenges. Discover how COIN AS helps Banking, Insurance, Utilities, and Government organizations stay resilient.',
    ),
  },
]

async function run() {
  console.log(`Seeding ${STUBS.length} stub page docs (SEO-only)…`)
  const now = Timestamp.now()

  for (const stub of STUBS) {
    const ref = db.collection('pages').doc(stub.slug)
    const snap = await ref.get()
    if (snap.exists) {
      // Don't overwrite existing data; only fill the SEO sub-doc when missing.
      const data = snap.data() ?? {}
      const update: Record<string, unknown> = { updatedAt: now }
      if (!data.seo) {
        update.seo = {
          metaTitle: stub.metaTitle,
          metaDescription: stub.metaDescription,
          ogImage: null,
        }
      }
      if (!data.title) update.title = stub.title
      if (data.sections === undefined) update.sections = []
      await ref.set(update, { merge: true })
      console.log(`  -> pages/${stub.slug} updated (existing doc preserved)`)
    } else {
      await ref.set({
        slug: stub.slug,
        title: stub.title,
        seo: {
          metaTitle: stub.metaTitle,
          metaDescription: stub.metaDescription,
          ogImage: null,
        },
        sections: [],
        createdAt: now,
        updatedAt: now,
      })
      console.log(`  -> pages/${stub.slug} created`)
    }
  }

  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
