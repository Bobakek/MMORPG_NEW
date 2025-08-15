"use client"

import { memo, useMemo, useRef } from "react"

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface StarfieldProps {
  count?: number
}

function StarfieldComponent({ count = 300 }: StarfieldProps) {
  const rng = useMemo(() => mulberry32(123456), [])
  const stars = useRef<
    Array<{
      id: number
      left: string
      top: string
      delay: string
      duration: string
    }>
  >([])

  if (stars.current.length === 0) {
    stars.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${rng() * 100}%`,
      top: `${rng() * 100}%`,
      delay: `${rng() * 3}s`,
      duration: `${2 + rng() * 2}s`,
    }))
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.current.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  )
}

export const Starfield = memo(StarfieldComponent)

export default Starfield
