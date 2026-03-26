'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Calendar } from 'lucide-react'

interface EventBannerProps {
  message: string
  linkText?: string
  linkHref?: string
}

export default function EventBanner({ message, linkText, linkHref }: EventBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-accent-500 text-white relative">
      <div className="container-padding py-2.5 flex items-center justify-center gap-3 text-sm font-medium">
        <Calendar className="h-4 w-4 flex-shrink-0" />
        <span>{message}</span>
        {linkText && linkHref && (
          <Link
            href={linkHref}
            className="underline underline-offset-2 hover:text-accent-100 transition-colors font-semibold"
          >
            {linkText}
          </Link>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-accent-600 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
