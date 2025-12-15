"use client"

import { useEffect, useState } from "react"

export function ConfettiEffect() {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([])

  useEffect(() => {
    // Generate confetti particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute -top-10 w-2 h-2 rounded-full animate-fall"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            backgroundColor: Math.random() > 0.5 ? "oklch(0.72 0.19 166)" : "oklch(0.82 0.21 328)",
          }}
        />
      ))}
    </div>
  )
}
