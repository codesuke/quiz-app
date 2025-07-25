"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface Quiz {
  id: string
  code: string
  title: string
  description: string
  questions: Question[]
  createdBy: string
  createdAt: string
}

interface LeaderboardEntry {
  userId: string
  userName: string
  score: number
  completedAt: string
}

interface QuizContextType {
  createQuiz: (quiz: Omit<Quiz, "id" | "code" | "createdAt">) => string
  getQuiz: (code: string) => Quiz | null
  submitQuizAnswer: (quizCode: string, userId: string, score: number) => void
  getLeaderboard: (quizCode: string) => LeaderboardEntry[]
  updateUserStats: (newStats: any, newActivity?: any) => void
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({})

  useEffect(() => {
    // Load data from localStorage on mount
    const savedQuizzes = localStorage.getItem("quiz-app-quizzes")
    const savedLeaderboards = localStorage.getItem("quiz-app-leaderboards")

    if (savedQuizzes) {
      setQuizzes(JSON.parse(savedQuizzes))
    } else {
      // Initialize with sample quizzes
      const sampleQuizzes: Quiz[] = [
        {
          id: "sample1",
          code: "ABC123",
          title: "JavaScript Basics",
          description: "Test your knowledge of JavaScript fundamentals",
          questions: [
            {
              id: "1",
              question: "What is the correct way to declare a variable in JavaScript?",
              options: ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
              correctAnswer: 0,
            },
            {
              id: "2",
              question: "Which method is used to add an element to the end of an array?",
              options: ["append()", "push()", "add()", "insert()"],
              correctAnswer: 1,
            },
            {
              id: "3",
              question: 'What does "=== " operator do in JavaScript?',
              options: ["Assignment", "Equality check", "Strict equality check", "Not equal"],
              correctAnswer: 2,
            },
          ],
          createdBy: "admin",
          createdAt: "2024-01-10",
        },
      ]
      setQuizzes(sampleQuizzes)
    }

    if (savedLeaderboards) {
      setLeaderboards(JSON.parse(savedLeaderboards))
    } else {
      // Initialize with sample leaderboard
      setLeaderboards({
        ABC123: [
          {
            userId: "user1",
            userName: "Alice Johnson",
            score: 100,
            completedAt: "2024-01-15T10:30:00Z",
          },
          {
            userId: "user2",
            userName: "Bob Smith",
            score: 85,
            completedAt: "2024-01-15T11:15:00Z",
          },
        ],
      })
    }
  }, [])

  useEffect(() => {
    // Save to localStorage whenever data changes with error handling
    try {
      localStorage.setItem("quiz-app-quizzes", JSON.stringify(quizzes))
    } catch (error) {
      console.error("Failed to save quizzes to localStorage:", error)
    }
  }, [quizzes])

  useEffect(() => {
    try {
      localStorage.setItem("quiz-app-leaderboards", JSON.stringify(leaderboards))
    } catch (error) {
      console.error("Failed to save leaderboards to localStorage:", error)
    }
  }, [leaderboards])

  const generateQuizCode = (): string => {
    let code: string
    let attempts = 0
    const maxAttempts = 100

    do {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      code = ""
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      attempts++
    } while (quizzes.some((quiz) => quiz.code === code) && attempts < maxAttempts)

    return code
  }

  const createQuiz = (quizData: Omit<Quiz, "id" | "code" | "createdAt">): string => {
    const code = generateQuizCode()
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz_${Date.now()}`,
      code,
      createdAt: new Date().toISOString(),
    }

    setQuizzes((prev) => {
      const updated = [...prev, newQuiz]
      // Immediately save to localStorage
      localStorage.setItem("quiz-app-quizzes", JSON.stringify(updated))
      return updated
    })

    setLeaderboards((prev) => {
      const updated = { ...prev, [code]: [] }
      // Immediately save to localStorage
      localStorage.setItem("quiz-app-leaderboards", JSON.stringify(updated))
      return updated
    })

    // Update user's created quizzes in localStorage
    const currentUser = JSON.parse(localStorage.getItem("quiz-app-user") || "{}")
    if (currentUser.id === quizData.createdBy) {
      const newCreatedQuiz = {
        code: code,
        title: quizData.title,
        createdAt: new Date().toLocaleDateString(),
      }

      currentUser.createdQuizzes = currentUser.createdQuizzes || []
      currentUser.createdQuizzes.push(newCreatedQuiz)
      currentUser.stats = currentUser.stats || { quizzesJoined: 0, quizzesCreated: 0, averageScore: 0, bestScore: 0 }
      currentUser.stats.quizzesCreated = (currentUser.stats.quizzesCreated || 0) + 1

      localStorage.setItem("quiz-app-user", JSON.stringify(currentUser))

      // Trigger a custom event to update the auth context
      window.dispatchEvent(new CustomEvent("userUpdated", { detail: currentUser }))
    }

    return code
  }

  const getQuiz = (code: string): Quiz | null => {
    return quizzes.find((quiz) => quiz.code === code) || null
  }

  const submitQuizAnswer = (quizCode: string, userId: string, score: number) => {
    const user = JSON.parse(localStorage.getItem("quiz-app-user") || "{}")

    const newEntry: LeaderboardEntry = {
      userId,
      userName: user.name || "Anonymous",
      score,
      completedAt: new Date().toISOString(),
    }

    setLeaderboards((prev) => {
      const currentLeaderboard = prev[quizCode] || []
      const existingEntryIndex = currentLeaderboard.findIndex((entry) => entry.userId === userId)

      let updatedLeaderboard
      if (existingEntryIndex >= 0) {
        // Update existing entry if new score is better
        updatedLeaderboard = currentLeaderboard.map((entry, index) =>
          index === existingEntryIndex && score > entry.score ? newEntry : entry,
        )
      } else {
        // Add new entry
        updatedLeaderboard = [...currentLeaderboard, newEntry]
      }

      // Sort by score (highest first)
      updatedLeaderboard.sort((a, b) => b.score - a.score)

      return {
        ...prev,
        [quizCode]: updatedLeaderboard,
      }
    })
  }

  const getLeaderboard = (quizCode: string): LeaderboardEntry[] => {
    return leaderboards[quizCode] || []
  }

  // Add a function to manually refresh quiz data
  const refreshQuizData = () => {
    try {
      const savedQuizzes = localStorage.getItem("quiz-app-quizzes")
      const savedLeaderboards = localStorage.getItem("quiz-app-leaderboards")

      if (savedQuizzes) {
        setQuizzes(JSON.parse(savedQuizzes))
      }

      if (savedLeaderboards) {
        setLeaderboards(JSON.parse(savedLeaderboards))
      }
    } catch (error) {
      console.error("Failed to refresh quiz data:", error)
    }
  }

  const updateUserStats = (newStats: any, newActivity?: any) => {
    const currentUser = JSON.parse(localStorage.getItem("quiz-app-user") || "{}")
    if (currentUser.id) {
      const updatedUser = {
        ...currentUser,
        stats: {
          ...currentUser.stats,
          ...newStats,
        },
        recentActivity: newActivity
          ? [newActivity, ...(currentUser.recentActivity || []).slice(0, 4)]
          : currentUser.recentActivity,
      }

      localStorage.setItem("quiz-app-user", JSON.stringify(updatedUser))

      // Trigger a custom event to update the auth context
      window.dispatchEvent(new CustomEvent("userUpdated", { detail: updatedUser }))
    }
  }

  return (
    <QuizContext.Provider
      value={{
        createQuiz,
        getQuiz,
        submitQuizAnswer,
        getLeaderboard,
        updateUserStats,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider")
  }
  return context
}
