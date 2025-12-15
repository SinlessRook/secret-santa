"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift } from "lucide-react"

interface TargetCardProps {
  tags: string[]
  vibeClues: string[]
  isLocked: boolean
}

export function TargetCard({ tags, vibeClues, isLocked }: TargetCardProps) {
  return (
    <Card className="bg-card border-2 border-border overflow-hidden">
      <div className="bg-muted/30 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          <span className="text-xs font-mono font-bold text-primary tracking-wider">YOUR SECRET SANTA</span>
        </div>
        {isLocked && (
          <Badge variant="outline" className="border-primary text-primary font-mono text-xs">
            MYSTERY
          </Badge>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
        {/* Profile Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-mono text-muted-foreground">PROFILE TAGS</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-2 border-primary/50 bg-primary/10 text-primary px-2.5 sm:px-3 py-1 sm:py-1.5 font-mono text-xs"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Vibe Clues */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-mono text-muted-foreground">PERSONALITY CLUES</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            {vibeClues.map((clue, index) => (
              <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                <p className="text-foreground/90 leading-relaxed">{clue}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative bg-muted/50 rounded-lg p-3 sm:p-4 overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-xl bg-muted/80 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Gift className="h-7 w-7 sm:h-8 sm:w-8 text-primary mx-auto animate-pulse" />
              <p className="text-xs font-mono text-muted-foreground">Reveal on Dec 24th</p>
            </div>
          </div>
          <div className="blur-sm select-none pointer-events-none opacity-30">
            <p className="text-base sm:text-lg font-bold">SNEHA PATEL</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Class B - Roll 42</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
