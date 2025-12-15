"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight } from "lucide-react"

interface QuizResultProps {
  profileType: string
  tags: string[]
  onContinue: () => void
}

export function QuizResult({ profileType, tags, onContinue }: QuizResultProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Analyzing Animation */}
        <div className="text-center space-y-4 mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <Sparkles className="h-16 w-16 text-primary relative animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-mono text-muted-foreground">Analyzing profile...</p>
            <div className="flex items-center justify-center gap-1">
              <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>

        {/* Result Card */}
        <Card className="bg-card border-2 border-primary p-8 shadow-2xl shadow-primary/20">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-mono text-muted-foreground">You are a</p>
              <h2 className="text-3xl font-bold text-primary animate-glow">#{profileType}</h2>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 justify-center">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-2 border-primary/50 bg-primary/10 text-primary px-3 py-1 text-sm font-mono"
                >
                  #{tag}
                </Badge>
              ))}
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-sm text-muted-foreground">Profile encrypted and stored</p>
              <p className="text-xs text-muted-foreground/60 font-mono">{"// Ready for mission briefing"}</p>
            </div>
          </div>
        </Card>

        {/* Continue Button */}
        <Button
          onClick={onContinue}
          className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/50"
        >
          Access Mission Hub
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
