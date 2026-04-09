'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SERVICE_TABS = [
  { label: 'Consultancy', href: '/services/consultancy' },
  { label: 'BIA & BCP', href: '/services/business-continuity' },
  { label: 'DRS Audit', href: '/services/crisis-management' },
  { label: 'Simulation', href: '/services/cyber-resilience' },
  { label: 'Training', href: '/services/training' },
]

export default function ServiceSubNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-primary-500 sticky top-0 z-30">
      <div className="container-padding">
        <div className="flex justify-center gap-2 py-2 overflow-x-auto scrollbar-hide">
          {SERVICE_TABS.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-primary-700'
                    : 'text-white/80 hover:text-white hover:bg-primary-600'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
