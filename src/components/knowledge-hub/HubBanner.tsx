import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface QuickLink {
  label: string
  href: string
  count?: number
}

interface HubBannerProps {
  title: string
  quickLinks?: QuickLink[]
  backToHub?: boolean
}

export default function HubBanner({ title, quickLinks, backToHub = false }: HubBannerProps) {
  return (
    <section className="bg-warm-50 border-b border-secondary-100">
      <div className="container-padding py-10 md:py-12">
        <div className="max-w-6xl mx-auto">
          {backToHub && (
            <Link
              href="/knowledge-hub"
              className="inline-flex items-center gap-1.5 text-sm text-secondary-500 hover:text-primary-600 font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Knowledge Hub
            </Link>
          )}

          <div className="w-12 h-1 bg-accent-500 rounded-full mb-4" />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 font-display tracking-tight">
            {title}
          </h1>

          {quickLinks && quickLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-secondary-200 text-sm font-semibold text-secondary-700 hover:border-primary-500 hover:text-primary-600 hover:shadow-sm transition-all"
                >
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="bg-accent-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none font-bold">
                      {link.count}
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
