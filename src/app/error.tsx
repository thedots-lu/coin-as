'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold text-secondary-800 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-primary"
          >
            Try Again
          </button>
          <a href="/" className="btn-outline inline-block">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
