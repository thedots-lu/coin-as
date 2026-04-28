'use client'

import { useEffect, useRef, useState, useCallback, PointerEvent as ReactPointerEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Logo {
  url: string
  name: string
}

interface Props {
  logos: Logo[]
}

const CARD_WIDTH = 260 // matches w-[260px] in JSX
const GAP = 24 // matches gap-6
const STEP = CARD_WIDTH + GAP
const AUTO_SPEED_PX_PER_SEC = 70 // tuned: ~26s to scan 19 logos vs ~140s previously
const JUMP_CARDS = 3

export default function LogoMarquee({ logos }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef(0)
  const wrapRef = useRef(0)
  const pausedRef = useRef(false)
  const draggingRef = useRef<{ startX: number; startPos: number; pointerId: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Repeat logos enough times for a seamless loop
  const repeats = logos.length < 6 ? 6 : 3
  const repeated = Array.from({ length: repeats }, () => logos).flat()

  // Helpers to wrap the position into a single repeat window
  const wrapPosition = useCallback((p: number, wrap: number) => {
    if (wrap <= 0) return p
    let x = p
    while (x <= -wrap) x += wrap
    while (x > 0) x -= wrap
    return x
  }, [])

  // rAF auto-scroll loop
  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) // cap dt to avoid jumps after tab-switch
      last = now

      const track = trackRef.current
      if (track) {
        if (wrapRef.current === 0) {
          wrapRef.current = track.scrollWidth / repeats
        }
        if (!pausedRef.current && !draggingRef.current) {
          positionRef.current -= AUTO_SPEED_PX_PER_SEC * dt
        }
        positionRef.current = wrapPosition(positionRef.current, wrapRef.current)
        track.style.transform = `translate3d(${positionRef.current}px, 0, 0)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [repeats, wrapPosition])

  // Recompute wrap when window resizes (logos may reflow)
  useEffect(() => {
    const onResize = () => {
      const track = trackRef.current
      if (track) wrapRef.current = track.scrollWidth / repeats
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [repeats])

  const jump = useCallback((direction: -1 | 1) => {
    // direction=+1 moves forward (continues marquee direction → strip slides left → position decreases)
    positionRef.current -= direction * STEP * JUMP_CARDS
  }, [])

  // Drag-to-scrub
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    draggingRef.current = {
      startX: e.clientX,
      startPos: positionRef.current,
      pointerId: e.pointerId,
    }
    setIsDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = draggingRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const delta = e.clientX - drag.startX
    positionRef.current = drag.startPos + delta
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = draggingRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* may already be released */
    }
    draggingRef.current = null
    setIsDragging(false)
  }

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-warm-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-warm-50 to-transparent z-10 pointer-events-none" />

      {/* Prev button */}
      <button
        type="button"
        onClick={() => jump(-1)}
        aria-label="Previous logos"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-secondary-700 hover:text-primary-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Next button */}
      <button
        type="button"
        onClick={() => jump(1)}
        aria-label="Next logos"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-secondary-700 hover:text-primary-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div
        className="overflow-hidden"
        onMouseEnter={() => {
          pausedRef.current = true
        }}
        onMouseLeave={() => {
          pausedRef.current = false
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'pan-y',
          userSelect: 'none',
        }}
      >
        <div
          ref={trackRef}
          className="flex items-center gap-6 py-4 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {repeated.map((logo, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center w-[260px] h-[150px] bg-white rounded-2xl shadow-sm px-7 pointer-events-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.url}
                alt={logo.name || ''}
                className="max-h-[100px] max-w-full object-contain"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
