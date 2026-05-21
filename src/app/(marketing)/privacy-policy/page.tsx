import { getPage } from '@/lib/firestore/pages'
import { getSiteConfig } from '@/lib/firestore/site-config'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { getLocalizedField } from '@/lib/locale'
import { Download } from 'lucide-react'
import PageSectionRenderer from '@/components/sections/PageSectionRenderer'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('privacy-policy')
  if (!page) return { title: 'Privacy Policy' }
  return generatePageMetadata(page.seo, page.title, { path: '/privacy-policy' })
}

export default async function PrivacyPolicyPage() {
  const [pageData, siteConfig] = await Promise.all([
    getPage('privacy-policy'),
    getSiteConfig(),
  ])

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Privacy policy page not found.</p>
      </div>
    )
  }

  const title = getLocalizedField(pageData.title)
  const pdfUrl = siteConfig?.privacyPolicyPdf

  return (
    <>
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white py-16">
        <div className="relative container-padding max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{title || 'Privacy Policy'}</h1>
        </div>
      </section>

      {/* Editable intro — managed via the visual editor (free_text section). */}
      <PageSectionRenderer sections={pageData.sections ?? []} />

      {pdfUrl && (
        <section className="py-8">
          <div className="container-padding max-w-6xl mx-auto flex items-center justify-center min-h-[15vh]">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-primary-600 text-white text-sm font-medium transition-colors hover:bg-primary-700"
            >
              <Download className="h-4 w-4" />
              Download the full privacy policy (PDF)
            </a>
          </div>
        </section>
      )}
    </>
  )
}
