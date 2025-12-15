"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TargetCard } from "@/components/target-card" 
import { GiftAdvice } from "@/components/gift-advice"
import { Gift, Loader2, Lock, Clock, AlertTriangle } from "lucide-react"
import { Snowfall } from "@/components/snowfall"
import { ChristmasLights } from "@/components/christmas-lights"

// --- HELPER: GIFT IDEAS ---
const getSuggestions = (tags: string[]) => {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return []
  
  const suggestions = ["A heartfelt handwritten card", "Chocolates or Snacks"]
  const tagStr = tags.join("").toLowerCase()
  
  if (tagStr.includes("coffee") || tagStr.includes("caffeine")) suggestions.push("Cool Coffee Mug", "Starbucks Gift Card")
  if (tagStr.includes("tech") || tagStr.includes("gamer")) suggestions.push("Desk Mat", "Tech Stickers", "Cable Organizer")
  if (tagStr.includes("book") || tagStr.includes("reading")) suggestions.push("Cool Bookmark", "Novel")
  if (tagStr.includes("food") || tagStr.includes("maggi")) suggestions.push("Snack Hamper", "Ramen Bowl")
  if (tagStr.includes("gym")) suggestions.push("Sipper Bottle", "Wrist Bands")
  
  return suggestions.slice(0, 4)
}

// --- HELPER: COUNTDOWN FORMATTER ---
const calculateTimeLeft = (targetDate: string | null) => {
  if (!targetDate) return "Loading..."
  const difference = +new Date(targetDate) - +new Date()
  
  if (difference <= 0) return "Ready!"

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((difference / 1000 / 60) % 60)
  const seconds = Math.floor((difference / 1000) % 60)

  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

export default function MissionHubPage() {
  const router = useRouter()
  
  // --- STATES ---
  const [loading, setLoading] = useState(true)
  const [missionStatus, setMissionStatus] = useState<"WAITING" | "CLASSIFIED" | "REVEALED" | null>(null)
  const [targetData, setTargetData] = useState<any>(null)
  const [revealDate, setRevealDate] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // 1. FETCH DATA
  useEffect(() => {
    const fetchMission = async () => {
      const token = localStorage.getItem("santa_token")
      if (!token) { router.push("/"); return }

      try {
        const res = await fetch("/api/mission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        })
        
        if (!res.ok) throw new Error(`Server Error: ${res.status}`)

        const data = await res.json()

        if (data.status === "WAITING_FOR_MATCH") {
          setMissionStatus("WAITING")
        } else if (data.status === "CLASSIFIED" || data.status === "REVEALED") {
          setMissionStatus(data.status)
          setTargetData(data.target || data.data || {}) 
          setRevealDate(data.revealDate)
        }
      } catch (error) {
        setErrorMessage("Could not load mission data.")
      } finally {
        setLoading(false)
      }
    }
    fetchMission()
  }, [router])

  // 2. COUNTDOWN TIMER
  useEffect(() => {
    if (missionStatus === "CLASSIFIED" && revealDate) {
      const timer = setInterval(() => {
        const remaining = calculateTimeLeft(revealDate)
        setTimeLeft(remaining)
        
        // Auto-refresh page when timer hits 0 to unlock button
        if (remaining === "Ready!") {
            window.location.reload()
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [missionStatus, revealDate])

  // --- RENDER: LOADING ---
  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground font-mono">Accessing Santa Network...</p>
    </div>
  )

  // --- RENDER: ERROR ---
  if (errorMessage) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <p className="text-destructive font-bold">{errorMessage}</p>
    </div>
  )

  // --- RENDER: WAITING / TARGET NOT READY ---
  const isTargetNotReady = targetData && (!targetData.tags || targetData.tags.length === 0);
  
  if (missionStatus === "WAITING" || isTargetNotReady) {
     return (
      <>
        <Snowfall />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-card border-2 border-primary/20 p-8 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 blur-3xl" />
            <Clock className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse relative z-10" />
            <h1 className="text-2xl font-bold text-white mb-2 relative z-10">
              {missionStatus === "WAITING" ? "Matching in Progress" : "Generating Profile"}
            </h1>
            <p className="text-muted-foreground mb-8 relative z-10">
              {missionStatus === "WAITING" 
                ? "The Admins are currently shuffling the names. Check back soon!"
                : "Your target has been assigned, but they haven't finished their Quiz yet. We need their data to give you clues."}
            </p>
            <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-primary w-2/3 animate-[shimmer_2s_infinite]" />
            </div>
            <p className="text-xs text-muted-foreground/50 mt-4 font-mono relative z-10">
              STATUS: {missionStatus === "WAITING" ? "PENDING_ADMIN" : "TARGET_NOT_REGISTERED"}
            </p>
          </div>
        </div>
      </>
     )
  }

  // --- RENDER: ACTIVE DASHBOARD ---
  const isRevealed = missionStatus === "REVEALED"
  const suggestions = getSuggestions(targetData?.tags || [])

  return (
    <>
      <Snowfall />
      <ChristmasLights />

      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <div className="bg-card border-b-2 border-primary/30 px-4 py-3 sm:py-4 shadow-lg shadow-primary/10">
          <div className="max-w-md mx-auto flex items-center gap-3">
             <div className="relative">
               <div className="absolute inset-0 bg-primary/20 blur-md rounded-full" />
               <Gift className="h-7 w-7 text-primary relative animate-pulse" />
             </div>
             <div className="flex-1 pt-6">
               <h1 className="font-bold text-base text-primary">Secret Santa Dashboard</h1>
               <p className="text-xs text-muted-foreground font-mono">
                 {isRevealed ? "IDENTITY UNLOCKED" : "IDENTITY CLASSIFIED"}
               </p>
             </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-md mx-auto p-4 space-y-6">
          
          {/* Status Banner */}
          <div className={`border-l-4 p-4 rounded-r ${isRevealed ? "bg-green-900/20 border-green-500" : "bg-muted/50 border-primary"}`}>
            <p className="text-sm font-mono">
              <span className={isRevealed ? "text-green-500 font-bold" : "text-primary font-bold"}>
                STATUS:
              </span>{" "}
              <span className="text-foreground">
                {isRevealed 
                  ? `Target name revealed!!` 
                  : "Target Hidden. Use clues to buy gift."}
              </span>
            </p>
          </div>

          <TargetCard 
            tags={targetData?.tags || []} 
            // ✅ FIX: Pass the array directly, fallback to empty array
            vibeClues={targetData?.clues || []} 
            isLocked={!isRevealed}
          />

          <GiftAdvice suggestions={suggestions} />
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border p-4 shadow-2xl safe-area-bottom z-50">
          <div className="max-w-md mx-auto">
            
            {/* 1. REVEAL BUTTON (Shows only when Ready) */}
            {isRevealed && (
              <Button
                onClick={() => router.push("/countdown")}
                className="w-full h-14 font-bold bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg animate-pulse"
              >
                <Gift className="mr-2 h-5 w-5" />
                REVEAL MY TARGET
              </Button>
            )}
             
            {/* 2. LOCKED BUTTON WITH COUNTDOWN (Shows when Classified) */}
            {!isRevealed && (
               <Button disabled variant="secondary" className="w-full h-14 opacity-90 cursor-not-allowed bg-secondary/50 border-2 border-dashed border-secondary">
                  <Lock className="mr-2 h-4 w-4 animate-pulse"/> 
                  <span className="font-mono text-xs sm:text-sm">
                    UNLOCKS IN: {timeLeft || "CALCULATING..."}
                  </span>
               </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}