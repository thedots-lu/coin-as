import { getPage } from '@/lib/firestore/pages'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/utils/metadata'
import { getLocalizedField } from '@/lib/locale'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('legal-notice')
  if (!page) return { title: 'Legal Notice' }
  return generatePageMetadata(page.seo, page.title)
}

export default async function LegalNoticePage() {
  const pageData = await getPage('legal-notice')

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Legal notice page not found.</p>
      </div>
    )
  }

  const title = getLocalizedField(pageData.title)
  const body = pageData.body ? getLocalizedField(pageData.body) : ''

  return (
    <>
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white py-16">
        <div className="relative container-padding max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{title || 'Legal Notice'}</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container-padding max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none" style={{ whiteSpace: 'pre-line' }}>
            {body}
          </div>
        </div>
      </section>
    </>
  )
}
