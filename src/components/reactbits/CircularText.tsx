'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface CircularTextProps {
  text: string
  spinDuration?: number
  onHover?: 'speedUp' | 'slowDown' | 'pause' | 'reverse'
  className?: string
  radius?: number
  fontSize?: number
  letterSpacing?: number
}

export default function CircularText({
  text,
  spinDuration = 20,
  onHover = 'speedUp',
  className = '',
  radius = 80,
  fontSize = 13,
  letterSpacing = 2,
}: CircularTextProps) {
  const rotationRef = useRef(0)
  const speedRef = useRef(1)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const groupRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current) {
        const delta = time - lastTimeRef.current
        rotationRef.current += (delta / 1000) * (360 / spinDuration) * speedRef.current
        if (groupRef.current) {
          groupRef.current.setAttribute(
            'transform',
            `rotate(${rotationRef.current}, ${radius + 10}, ${radius + 10})`,
          )
        }
      }
      lastTimeRef.current = time
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [spinDuration, radius])

  const handleMouseEnter = () => {
    switch (onHover) {
      case 'speedUp':
        speedRef.current = 3
        break
      case 'slowDown':
        speedRef.current = 0.3
        break
      case 'pause':
        speedRef.current = 0
        break
      case 'reverse':
        speedRef.current = -1
        break
    }
  }

  const handleMouseLeave = () => {
    speedRef.current = 1
  }

  const size = (radius + 10) * 2

  return (
    <motion.div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      style={{
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="100%"
      >
        <defs>
          <path
            id="circlePath"
            d={`M ${radius + 10}, ${10}
                a ${radius},${radius} 0 1,1 0,${radius * 2}
                a ${radius},${radius} 0 1,1 0,-${radius * 2}`}
            fill="none"
          />
        </defs>
        <g ref={groupRef}>
          <text
            fill="currentColor"
            fontSize={fontSize}
            fontWeight="600"
            letterSpacing={letterSpacing}
          >
            <textPath href="#circlePath" startOffset="0%">
              {text}
            </textPath>
          </text>
        </g>
      </svg>
    </motion.div>
  )
}
