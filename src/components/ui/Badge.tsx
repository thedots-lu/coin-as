import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'accent'
}

const variantClasses: Record<string, string> = {
  default: 'bg-primary-100 text-primary-700',
  accent: 'bg-accent-100 text-accent-700',
}

export default function Badge({
  children,
  className = '',
  variant = 'default',
}: BadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
