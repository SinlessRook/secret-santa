"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Clock, Gift } from "lucide-react"
import { Snowfall } from "@/components/snowfall"
import { ChristmasLights } from "@/components/christmas-lights"

export default function CountdownPage() {
  const [countdown, setCountdown] = useState(10)
  const router = useRouter()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      localStorage.setItem("countdownComplete", "true")
      router.push("/reveal")
    }
  }, [countdown, router])

  return (
    <>
      <Snowfall />
      <ChristmasLights />

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-2xl sm:blur-3xl rounded-full animate-pulse" />
              <Gift className="h-16 w-16 sm:h-20 sm:w-20 text-primary relative" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-balance">
              <span className="text-primary">Christmas Countdown</span>
              <br />
              <span className="text-foreground">Reveal Time</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-mono">Get ready for the big reveal...</p>
          </div>

          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-2xl sm:blur-3xl rounded-full animate-pulse" />
              <div className="relative">
                <div className="text-7xl sm:text-8xl font-bold text-primary animate-pulse">{countdown}</div>
              </div>
            </div>
          </div>

          <Card className="bg-muted/50 border-2 border-border p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Unwrapping Your Secret Santa</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  The moment you've been waiting for is almost here!
                </p>
              </div>
            </div>
          </Card>

          <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-3 sm:p-4">
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-primary">Opening Gift...</p>
              <p className="text-xs text-muted-foreground font-mono">Please wait</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
