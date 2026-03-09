'use client'

import { ReactNode, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  parallaxStrength?: number
  direction?: 'up' | 'down'
}

export default function ParallaxSection({
  children,
  className = '',
  parallaxStrength = 50,
  direction = 'up',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const yRange = direction === 'up'
    ? [parallaxStrength, -parallaxStrength]
    : [-parallaxStrength, parallaxStrength]

  const y = useTransform(scrollYProgress, [0, 1], yRange)

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}
