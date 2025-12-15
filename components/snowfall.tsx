"use client"

import { useEffect, useState } from "react"

interface Snowflake {
  id: number
  left: number
  animationDuration: number
  size: number
  opacity: number
  delay: number
}

export function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  useEffect(() => {
    // Create 30 snowflakes
    const flakes: Snowflake[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 10 + Math.random() * 20,
      size: 2 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.5,
      delay: Math.random() * 10,
    }))
    setSnowflakes(flakes)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-snowfall"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        >
          <div className="w-full h-full bg-white rounded-full shadow-sm shadow-white/50" />
        </div>
      ))}
    </div>
  )
}
