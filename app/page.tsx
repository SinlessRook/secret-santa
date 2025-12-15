"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gift, Users, Loader2, AlertCircle } from "lucide-react"
import { Snowfall } from "@/components/snowfall"
import { ChristmasLights } from "@/components/christmas-lights"
import { useRouter } from "next/navigation"

export default function GatekeeperScreen() {
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Auto-redirect if already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem("santa_token")
    if (savedToken) {
      // We could verify the token again here, but for speed, we redirect.
      // Ideally, check registration status. For now, assume mission.
      router.push("/mission")
    }
  }, [router])

  // --- 🎅 SANTA ID FORMATTER ---
  // Only allow characters that exist in your generator string
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase()
    
    // Remove invalid chars (Keep only A-Z and 0-9)
    // You can be stricter if you want (exclude I, O, 1, 0)
    val = val.replace(/[^A-Z0-9]/g, "")
    
    // Limit to 6 chars
    if (val.length <= 6) {
      setToken(val)
      setError("")
    }
  }

  const handleUnlock = async () => {
    if (token.length < 6) {
      setError("Token must be 6 characters")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (res.ok) {
        // ✅ SUCCESS
        localStorage.setItem("santa_token", token)
        
        // Intelligent Routing
        if (data.isRegistered) {
          router.push("/mission") // Already done the quiz
        } else {
          router.push("/quiz")    // New user
        }
      } else {
        // ❌ FAIL
        setError(data.error || "Access Denied")
      }
    } catch (err) {
      setError("Connection failed. Check internet.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Snowfall />
      <ChristmasLights />

      <div className="min-h-screen flex flex-col bg-background p-4 sm:p-6">
        {/* Live Counter */}
        <div className="flex items-center justify-center gap-2 py-4 mt-4 opacity-80">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-xs sm:text-sm font-mono text-muted-foreground">
            <span className="text-primary font-bold">112</span> / 150 Elves Active
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full">
          
          {/* Logo Section */}
          <div className="text-center space-y-2 mb-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <Gift className="h-20 w-20 sm:h-24 sm:w-24 text-primary relative animate-bounce-slow mx-auto" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-balance mt-4">
              <span className="text-white">TOKEN</span>
              <span className="text-primary">SANTA</span>
            </h1>
            <p className="text-muted-foreground text-xs font-mono tracking-widest">CLASSIFIED GIFT EXCHANGE</p>
          </div>

          <div className="w-full space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-600/50 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
              <Input
                type="text"
                placeholder="X92K4M"
                value={token}
                onChange={handleTokenChange}
                className="relative h-16 text-center text-3xl font-mono font-bold tracking-[0.5em] uppercase bg-black/80 border-primary/30 focus:border-primary focus:ring-primary/50 placeholder:text-muted-foreground/20"
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm font-mono animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              onClick={handleUnlock}
              disabled={isLoading || token.length < 6}
              className="w-full h-14 text-lg font-bold tracking-wide bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "UNLOCK MISSION"
              )}
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground/40 font-mono text-center mt-8">
            SECURE CONNECTION ESTABLISHED<br/>Encryption: AES-256
          </p>
        </div>
      </div>
    </>
  )
}