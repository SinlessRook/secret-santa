"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuizOption {
  id: string
  label: string
  icon?: string
}

interface QuizCardProps {
  question: string
  options: QuizOption[]
  currentQuestion: number
  totalQuestions: number
  onAnswer: (answerId: string) => void
}

export function QuizCard({ question, options, currentQuestion, totalQuestions, onAnswer }: QuizCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Bar - Better mobile spacing */}
      <div className="mb-6 sm:mb-8 space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
          <span className="text-muted-foreground">Question {currentQuestion}</span>
          <span className="text-primary font-bold">
            {currentQuestion} / {totalQuestions}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card - Responsive padding and text sizing */}
      <Card className="bg-card border-2 border-border p-6 sm:p-8 mb-4 sm:mb-6 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-balance mb-6 text-center leading-tight">{question}</h2>

        {/* Options - Touch-friendly buttons with proper spacing */}
        <div className="space-y-3">
          {options.map((option) => (
            <Button
              key={option.id}
              onClick={() => onAnswer(option.id)}
              variant="outline"
              className={cn(
                "w-full h-14 sm:h-16 text-base sm:text-lg font-semibold",
                "bg-muted/50 hover:bg-primary hover:text-primary-foreground",
                "border-2 border-border hover:border-primary",
                "transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
              )}
            >
              {option.icon && <span className="mr-2 text-xl sm:text-2xl">{option.icon}</span>}
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Hint Text */}
      <p className="text-center text-xs text-muted-foreground font-mono">{"// Select your answer to continue"}</p>
    </div>
  )
}
