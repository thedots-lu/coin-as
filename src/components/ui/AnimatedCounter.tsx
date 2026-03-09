'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface AnimatedCounterProps {
  end: number
  duration?: number
  delay?: number
  suffix?: string
  className?: string
  decimals?: number
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export default function AnimatedCounter({
  end,
  duration = 2000,
  delay = 0,
  suffix = '',
  className = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)
  const hasAnimated = useRef(false)

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  })

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true

    const timeoutId = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp
        }

        const elapsed = timestamp - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeOutExpo(progress)
        const currentValue = easedProgress * end

        setDisplayValue(currentValue)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [inView, end, duration, delay])

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString()

  return (
    <span ref={ref} className={className}>
      {formatted}{suffix}
    </span>
  )
}
