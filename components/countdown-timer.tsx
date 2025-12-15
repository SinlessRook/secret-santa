"use client"

import { useState, useEffect } from "react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownTimerProps {
  targetDate: Date
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="grid grid-cols-4 gap-3">
      <TimeUnit value={timeLeft.days} label="DAYS" />
      <TimeUnit value={timeLeft.hours} label="HRS" />
      <TimeUnit value={timeLeft.minutes} label="MIN" />
      <TimeUnit value={timeLeft.seconds} label="SEC" isPulsing />
    </div>
  )
}

interface TimeUnitProps {
  value: number
  label: string
  isPulsing?: boolean
}

function TimeUnit({ value, label, isPulsing }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`
        bg-card border-2 border-border rounded-lg p-4 w-full
        flex items-center justify-center
        ${isPulsing ? "animate-pulse-border" : ""}
      `}
      >
        <span className="text-4xl font-bold font-mono tabular-nums text-primary">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs font-mono text-muted-foreground mt-2 tracking-wider">{label}</span>
    </div>
  )
}
