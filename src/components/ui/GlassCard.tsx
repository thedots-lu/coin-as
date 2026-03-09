'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hoverEffect?: boolean
  shineEffect?: boolean
}

export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  shineEffect = false,
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-morphism ${shineEffect ? 'shine-effect' : ''} ${className}`}
      whileHover={
        hoverEffect
          ? { scale: 1.02, boxShadow: '0 12px 40px rgba(31, 38, 135, 0.15)' }
          : undefined
      }
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
