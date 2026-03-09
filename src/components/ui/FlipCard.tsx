'use client'

import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'

interface FlipCardProps {
  frontContent: ReactNode
  backContent: ReactNode
  className?: string
  onClick?: () => void
  triggerOnHover?: boolean
}

export default function FlipCard({
  frontContent,
  backContent,
  className = '',
  onClick,
  triggerOnHover = false,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    if (!triggerOnHover) {
      setIsFlipped((prev) => !prev)
      onClick?.()
    }
  }

  return (
    <div
      className={`flip-card ${className}`}
      onClick={handleFlip}
      onMouseEnter={triggerOnHover ? () => setIsFlipped(true) : undefined}
      onMouseLeave={triggerOnHover ? () => setIsFlipped(false) : undefined}
    >
      <motion.div
        className="flip-card-inner w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="flip-card-front"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {frontContent}
        </div>
        <div
          className="flip-card-back"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  )
}
