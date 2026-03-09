'use client'

import { ReactNode } from 'react'
import { motion, Variant } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

type Animation = 'fadeIn' | 'slideUp' | 'slideRight' | 'slideLeft' | 'zoomIn' | 'bounce'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  animation?: Animation
  duration?: number
  triggerOnce?: boolean
  threshold?: number
}

const animationVariants: Record<Animation, { hidden: Variant; visible: Variant }> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  bounce: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  },
}

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  animation = 'slideUp',
  duration = 0.6,
  triggerOnce = true,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const { ref, inView } = useInView({
    triggerOnce,
    threshold,
  })

  const variant = animationVariants[animation]

  const bounceTransition =
    animation === 'bounce' && typeof variant.visible === 'object' && variant.visible !== null
      ? (variant.visible as Record<string, unknown>).transition as Record<string, unknown> | undefined
      : undefined

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: variant.hidden,
        visible: {
          ...(typeof variant.visible === 'object' ? variant.visible : {}),
          transition: {
            duration,
            delay,
            ease: 'easeOut',
            ...((bounceTransition as object) ?? {}),
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
