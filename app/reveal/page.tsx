"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfettiEffect } from "@/components/confetti-effect"
import { MapPin, Gift, Sparkles, Loader2 } from "lucide-react"
import { Snowfall } from "@/components/snowfall"

export default function RevealPage() {
  const [showConfetti, setShowConfetti] = useState(false)
  const [targetData, setTargetData] = useState<any>(null) // Stores real student data
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 1. Security Check (Did they finish countdown?)
    const countdownComplete = localStorage.getItem("countdownComplete")
    const token = localStorage.getItem("santa_token")

    if (countdownComplete !== "true" || !token) {
      router.push("/mission")
      return
    }

    // 2. Fetch Real Data
    const fetchData = async () => {
      try {
        const res = await fetch("/api/mission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        })
        const data = await res.json()
        
        // If data is valid, save it
        if (data.target || data.data) {
          setTargetData(data.target || data.data)
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 8000) // Confetti for 8s
        }
      } catch (error) {
        console.error("Error fetching reveal data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  // --- ERROR STATE (If fetch failed) ---
  if (!targetData) return <div className="p-10 text-center">Failed to load data.</div>

  // --- RENDER REAL DATA ---
  return (
    <>
      <Snowfall />
      {showConfetti && <ConfettiEffect />}
      
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6 py-8">
          
          {/* Success Banner */}
          <div className="animate-reveal bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="font-bold text-primary">MERRY CHRISTMAS!</p>
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">Your Secret Santa revealed</p>
          </div>

          {/* Target Profile Card */}
          <Card className="animate-reveal bg-card border-2 border-primary overflow-hidden shadow-2xl shadow-primary/20">
            {/* Header */}
            <div className="bg-primary/10 border-b-2 border-primary/30 px-6 py-4">
              <div className="flex items-center gap-2 justify-center">
                <Gift className="h-5 w-5 text-primary" />
                <span className="text-sm font-mono font-bold text-primary tracking-wider">
                  YOUR SECRET SANTA TARGET
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <Avatar className="h-32 w-32 border-4 border-primary relative">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-3xl font-bold bg-primary/20 text-primary">
                      {targetData.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center space-y-1">
                  {/* REAL NAME FROM DB */}
                  <h1 className="text-3xl font-bold text-primary uppercase">{targetData.name}</h1>
                  <p className="text-sm text-muted-foreground font-mono">
                    {targetData.class}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-mono text-muted-foreground">PROFILE TAGS</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {targetData.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="border-primary/50 bg-primary/10 text-primary">
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location (Static or from DB if you saved it) */}
              <div className="bg-muted/50 border-2 border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">Their Christmas Wish</p>
                  <p className="text-sm text-muted-foreground">
                    May your holidays sparkle with joy and laughter!
                  </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Home Button */}
          <Button
            onClick={() => router.push("/mission")}
            className="w-full h-14 font-bold"
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </>
  )
}