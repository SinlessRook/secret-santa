"use client"

import { useState, useEffect } from "react"
import { QuizCard } from "@/components/quiz-card"
import { QuizResult } from "@/components/quiz-result"
import { Snowfall } from "@/components/snowfall"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea" 
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lightbulb, Send, Loader2 } from "lucide-react"

// --- 🎓 QUESTIONS ---
const quizQuestions = [
  {
    id: "attendance",
    question: "What is your attendance strategy?",
    options: [
      { id: "Topper", label: "100% Attendance", icon: "🤓" },
      { id: "Calculated", label: "Strictly 75%", icon: "📉" },
      { id: "Proxy", label: "Proxy King/Queen", icon: "👻" },
      { id: "Sleep", label: "I sleep through lectures", icon: "😴" },
    ],
  },
  {
    id: "exam",
    question: "How do you study for exams?",
    options: [
      { id: "Syllabus", label: "Start 1 month early", icon: "📅" },
      { id: "OneNight", label: "One Night Batting", icon: "🦇" },
      { id: "Beggar", label: "Begging for Notes", icon: "🙏" },
      { id: "God", label: "Jai Mata Di / Luck", icon: "🎲" },
    ],
  },
  {
    id: "canteen",
    question: "Standard Canteen Order?",
    options: [
      { id: "Chai", label: "Chai / Coffee", icon: "☕" },
      { id: "Maggi", label: "Maggi / Noodles", icon: "🍜" },
      { id: "Broke", label: "Just Water (Broke)", icon: "💸" },
      { id: "Feast", label: "Full Meal / Rich Kid", icon: "🍔" },
    ],
  },
  {
    id: "spot",
    question: "Where are you usually found?",
    options: [
      { id: "Library", label: "Library (AC)", icon: "❄️" },
      { id: "BackBench", label: "Back Benches", icon: "😎" },
      { id: "Ground", label: "Sports Ground / Gym", icon: "⚽" },
      { id: "Roaming", label: "Roaming Corridors", icon: "🚶" },
    ],
  },
  {
    id: "vibe",
    question: "Describe your College Vibe.",
    options: [
      { id: "Techie", label: "Coding / Hackathons", icon: "💻" },
      { id: "Artist", label: "Cultural / Dance / Art", icon: "🎭" },
      { id: "Gamer", label: "Gaming in Lab", icon: "🎮" },
      { id: "Lost", label: "Just here for degree", icon: "🎓" },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  
  // States
  const [checkingStatus, setCheckingStatus] = useState(true) // New Loading State
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [customAnswer, setCustomAnswer] = useState("")
  const [isTextStep, setIsTextStep] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [aiProfile, setAiProfile] = useState<{ tags: string[], clue: string } | null>(null)

  // --- 🔒 ROUTE GUARD (The Fix) ---
  // Checks if user is already registered. If yes, kicks them to /mission.
  useEffect(() => {
    const checkRegistration = async () => {
      const token = localStorage.getItem("santa_token")
      
      if (!token) {
        router.replace("/") // No token? Go to login
        return
      }

      try {
        // Reuse the Login API to check status
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        
        const data = await res.json()

        if (data.isRegistered) {
          // 🚫 ALREADY DONE QUIZ -> GO TO MISSION
          router.replace("/mission")
        } else {
          // ✅ NEW USER -> ALLOW QUIZ
          setCheckingStatus(false)
        }
      } catch (error) {
        console.error("Auth check failed", error)
        setCheckingStatus(false) // Let them try anyway if API fails
      }
    }

    checkRegistration()
  }, [router])

  // --- HELPER: PROFILE TITLE ---
  const getProfileTitle = () => {
    if (answers.vibe === "Techie") return "The Cyber Phantom";
    if (answers.vibe === "Gamer") return "The Pixel Paladin";
    if (answers.vibe === "Artist") return "The Creative Soul";
    if (answers.attendance === "Proxy") return "The Ghost Student";
    if (answers.attendance === "Sleep") return "The Professional Napper";
    if (answers.attendance === "Topper") return "The Academic Weapon";
    return "Campus Mystery";
  }

  // --- HANDLERS ---
  const handleAnswer = async (answerId: string) => {
    const newAnswers = { ...answers, [quizQuestions[currentQuestion].id]: answerId }
    setAnswers(newAnswers)

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      setIsTextStep(true)
    }
  }

  const handleTextSubmit = async () => {
    if (!customAnswer.trim()) return
    const finalAnswers = { ...answers, reveal: customAnswer }
    await submitQuizToAI(finalAnswers)
  }

  const submitQuizToAI = async (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true)
    try {
      const token = localStorage.getItem("santa_token")
      // Double check token exists
      if (!token) { router.push("/"); return }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, answers: finalAnswers }),
      })

      const data = await res.json()
      if (data.success) {
        setAiProfile({
          tags: data.generatedProfile.tags,
          clue: data.generatedProfile.clue
        })
        setShowResult(true)
      } else {
        alert("Failed to save profile.")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleContinue = () => router.push("/mission")

  // --- RENDER 1: CHECKING STATUS ---
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  // --- RENDER 2: AI ANALYZING ---
  if (isAnalyzing) {
    return (
      <>
        <Snowfall />
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
          <div className="animate-pulse text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold text-white mb-2">Calculating Vibe...</h2>
          <p className="text-gray-400">Consulting the Santa Algorithms...</p>
        </div>
      </>
    )
  }

  // --- RENDER 3: RESULT ---
  if (showResult && aiProfile) {
    return (
      <>
        <Snowfall />
        <QuizResult 
          profileType={getProfileTitle()} 
          tags={aiProfile.tags}      
          clue={aiProfile.clue} 
          onContinue={handleContinue} 
        />
      </>
    )
  }

  // --- RENDER 4: TEXT INPUT ---
  if (isTextStep) {
    return (
      <>
        <Snowfall />
        <div className="min-h-screen flex items-center justify-center bg-background py-6 px-4">
           <Card className="w-full max-w-md p-6 bg-card border-2 border-primary/20 shadow-2xl">
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono mb-2">
                   FINAL STEP
                </span>
                <h2 className="text-2xl font-bold text-foreground">One Last Hint...</h2>
                <p className="text-muted-foreground text-sm mt-1">
                   Tell us something specific so your Santa can identify you (but not too easily!).
                </p>
              </div>

              <div className="space-y-4">
                 <Textarea
                    className="w-full h-32 p-4 rounded-lg bg-background border-2 border-border focus:border-primary focus:ring-1 focus:ring-primary resize-none text-lg"
                    placeholder="e.g. I have a sticker of Gojo on my laptop..."
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                 />

                 <div className="bg-muted/50 p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                       <Lightbulb className="h-3 w-3" /> Examples
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                       <li>"I always carry a green water bottle."</li>
                       <li>"I sit in the first row of CS class."</li>
                       <li>"I was the one dancing on stage last week."</li>
                       <li>"My bag has a keychain of Pikachu."</li>
                    </ul>
                 </div>

                 <Button 
                    onClick={handleTextSubmit}
                    disabled={!customAnswer.trim()}
                    className="w-full h-12 font-bold text-lg bg-primary hover:bg-primary/90"
                 >
                    Finish & Submit <Send className="ml-2 h-4 w-4" />
                 </Button>
              </div>
           </Card>
        </div>
      </>
    )
  }

  // --- RENDER 5: QUIZ QUESTIONS ---
  return (
    <>
      <Snowfall />
      <div className="min-h-screen flex items-center justify-center bg-background py-6 px-4">
        <QuizCard
          question={quizQuestions[currentQuestion].question}
          options={quizQuestions[currentQuestion].options}
          currentQuestion={currentQuestion + 1}
          totalQuestions={quizQuestions.length + 1} 
          onAnswer={handleAnswer}
        />
      </div>
    </>
  )
}