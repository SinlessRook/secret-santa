"use client"

import { Card } from "@/components/ui/card"
import { Gift, Sparkles } from "lucide-react"

interface GiftAdviceProps {
  suggestions: string[]
}

export function GiftAdvice({ suggestions }: GiftAdviceProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30 p-5">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          <Gift className="h-6 w-6 text-primary relative" />
        </div>
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">AI Gift Recommendations</h3>
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-foreground/80 leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
