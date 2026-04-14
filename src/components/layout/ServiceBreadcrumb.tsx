import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface ServiceBreadcrumbProps {
  serviceTitle: string
}

export default function ServiceBreadcrumb({ serviceTitle }: ServiceBreadcrumbProps) {
  return (
    <nav className="bg-warm-50 border-b border-secondary-100" aria-label="Breadcrumb">
      <div className="container-padding py-3">
        <ol className="flex items-center gap-1.5 text-sm">
          <li>
            <Link href="/services" className="text-secondary-500 hover:text-primary-600 font-medium transition-colors">
              Services
            </Link>
          </li>
          <li><ChevronRight className="w-3.5 h-3.5 text-secondary-300" /></li>
          <li className="text-primary-900 font-semibold truncate">{serviceTitle}</li>
        </ol>
      </div>
    </nav>
  )
}
