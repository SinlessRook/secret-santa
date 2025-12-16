"use client"

import { useState, useEffect } from "react"
import { QuizCard } from "@/components/quiz-card"
import { QuizResult } from "@/components/quiz-result"
import { Snowfall } from "@/components/snowfall"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea" 
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lightbulb, Send, Loader2, PenTool, ArrowLeft } from "lucide-react"


// --- LOADING MESSAGES FOR AI ANALYSIS ---
const loadingMessages = [
  "Consulting the Santa Algorithms...",
  "Analysing your attendance record...",
  "Calculating Aura Points...",
  "wrapping up your profile...",
  "Assigning a secret identity...",
  "Mixing the perfect gift clues...",
];
// --- 🎓 QUESTIONS (Updated with Other Option) ---
const quizQuestions = [
  {
    id: "attendance",
    question: "What is your attendance strategy?",
    options: [
      { id: "Topper", label: "100% Attendance", icon: "🤓" },
      { id: "Calculated", label: "Strictly 75%", icon: "📉" },
      { id: "Proxy", label: "Proxy King/Queen", icon: "👻" },
      { id: "Sleep", label: "I sleep through lectures", icon: "😴" },
      { id: "Other", label: "Other (Type it)", icon: "✏️" },
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
      { id: "Other", label: "Other (Type it)", icon: "✏️" },
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
      { id: "Other", label: "Other (Type it)", icon: "✏️" },
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
      { id: "Other", label: "Other (Type it)", icon: "✏️" },
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
      { id: "Other", label: "Other (Type it)", icon: "✏️" },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  
  // States
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  
  // Final Text Step State
  const [customAnswer, setCustomAnswer] = useState("")
  const [isTextStep, setIsTextStep] = useState(false)
  
  // New "Other" Option States
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherInputValue, setOtherInputValue] = useState("")

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [aiProfile, setAiProfile] = useState<{ tags: string[], clue: string } | null>(null)

  // Loading message index for AI analysis
  // ... existing states ...
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

  // Cycle through loading messages when analyzing
  useEffect(() => {
    if (!isAnalyzing) return
    
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2000) // Change text every 2 seconds

    return () => clearInterval(interval)
  }, [isAnalyzing])

  // --- 🔒 ROUTE GUARD ---
  useEffect(() => {
    const checkRegistration = async () => {
      const token = localStorage.getItem("santa_token")
      if (!token) { router.replace("/"); return }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (data.isRegistered) { router.replace("/mission") } 
        else { setCheckingStatus(false) }
      } catch (error) {
        console.error("Auth check failed", error)
        setCheckingStatus(false)
      }
    }
    checkRegistration()
  }, [router])

  // --- HELPER: PROFILE TITLE ---
  const getProfileTitle = () => {
    // Basic heuristics (fallback if custom answers are used)
    const v = answers.vibe || "";
    const a = answers.attendance || "";
    
    if (v === "Techie") return "The Cyber Phantom";
    if (v === "Gamer") return "The Pixel Paladin";
    if (v === "Artist") return "The Creative Soul";
    if (a === "Proxy") return "The Ghost Student";
    if (a === "Sleep") return "The Professional Napper";
    if (a === "Topper") return "The Academic Weapon";
    return "Campus Mystery";
  }

  // --- HANDLERS ---
  
  // 1. Handle Selection from MCQ
  const handleAnswer = async (answerId: string) => {
    // If user clicked "Other", stop navigation and show input field
    if (answerId === "Other") {
      setOtherInputValue("") // Reset input
      setShowOtherInput(true)
      return
    }

    saveAnswerAndProceed(answerId)
  }

  // 2. Handle Submission of "Other" Text
  const handleOtherSubmit = () => {
    if (!otherInputValue.trim()) return
    // Save the text directly as the answer
    saveAnswerAndProceed(otherInputValue)
    setShowOtherInput(false) // Close the input view
  }

  // 3. Centralized Next Logic
  const saveAnswerAndProceed = (finalValue: string) => {
    const newAnswers = { ...answers, [quizQuestions[currentQuestion].id]: finalValue }
    setAnswers(newAnswers)

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      setIsTextStep(true)
    }
  }

  const handleFinalTextSubmit = async () => {
    if (!customAnswer.trim()) return
    const finalAnswers = { ...answers, reveal: customAnswer }
    await submitQuizToAI(finalAnswers)
  }

  const submitQuizToAI = async (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true)
    try {
      const token = localStorage.getItem("santa_token")
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

  // --- RENDER ---
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  if (isAnalyzing) {
    return (
     <>
        <Snowfall />
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
          
          {/* Main Icon */}
          <div className="animate-bounce text-6xl mb-6">🧠</div>
          
          {/* Main Status */}
          <h2 className="text-3xl font-bold text-white mb-6 animate-pulse">
            Calculating Vibe...
          </h2>

          {/* Cycling Detail Text */}
          <div className="flex flex-col items-center gap-3">
             <Loader2 className="h-8 w-8 text-primary animate-spin" />
             <p className="text-lg text-muted-foreground font-medium min-h-[2rem] transition-all duration-300">
               {loadingMessages[loadingMsgIndex]}
             </p>
          </div>

        </div>
      </>
    )
  }

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

  // --- RENDER: INTERMEDIATE "OTHER" INPUT ---
  // This screen appears when user clicks "Other" on an MCQ
  if (showOtherInput) {
    return (
      <>
        <Snowfall />
        <div className="min-h-screen flex items-center justify-center bg-background py-6 px-4">
          <Card className="w-full max-w-md p-6 bg-card border-2 border-primary/20 shadow-2xl animate-in fade-in zoom-in duration-300">
             <div className="mb-4">
               <button 
                 onClick={() => setShowOtherInput(false)}
                 className="flex items-center text-sm text-muted-foreground hover:text-white mb-4"
               >
                 <ArrowLeft className="h-4 w-4 mr-1" /> Back to options
               </button>
               <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                 <PenTool className="h-5 w-5 text-primary"/> 
                 Type your answer
               </h2>
               <p className="text-sm text-muted-foreground mt-1">
                 For: "{quizQuestions[currentQuestion].question}"
               </p>
             </div>

             <Textarea
                className="w-full h-24 p-3 rounded-lg bg-background border-2 border-border focus:border-primary resize-none text-lg mb-4"
                placeholder="Be specific..."
                value={otherInputValue}
                onChange={(e) => setOtherInputValue(e.target.value)}
                autoFocus
             />

             <Button 
                onClick={handleOtherSubmit}
                disabled={!otherInputValue.trim()}
                className="w-full h-12 font-bold bg-primary hover:bg-primary/90"
             >
                Confirm & Next <Send className="ml-2 h-4 w-4" />
             </Button>
          </Card>
        </div>
      </>
    )
  }

  // --- RENDER: FINAL TEXT INPUT ---
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
                   Tell us something specific so your Santa can identify you.
                </p>
              </div>

              <div className="space-y-4">
                 <Textarea
                    className="w-full h-32 p-4 rounded-lg bg-background border-2 border-border focus:border-primary resize-none text-lg"
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
                    </ul>
                 </div>

                 <Button 
                    onClick={handleFinalTextSubmit}
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

  // --- RENDER: STANDARD QUIZ ---
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