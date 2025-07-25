"use client"

import { createContext, useContext, type ReactNode } from "react"
import { DatabaseService } from "@/lib/database"
import type { Quiz, LeaderboardEntry } from "@/lib/supabase"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface QuizContextType {
  createQuiz: (quiz: Omit<Quiz, "id" | "code" | "created_at" | "updated_at">) => Promise<string | null>
  getQuiz: (code: string) => Promise<Quiz | null>
  submitQuizAnswer: (quizCode: string, userId: string, userName: string, score: number) => Promise<void>
  getLeaderboard: (quizCode: string) => Promise<LeaderboardEntry[]>
  getUserQuizzes: (userId: string) => Promise<Quiz[]>
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: ReactNode }) {
  const createQuiz = async (
    quizData: Omit<Quiz, "id" | "code" | "created_at" | "updated_at">,
  ): Promise<string | null> => {
    try {
      const code = await DatabaseService.generateUniqueQuizCode()
      const quizWithCode = { ...quizData, code }

      const createdCode = await DatabaseService.createQuiz(quizWithCode)

      // Update user's created quiz count
      if (createdCode) {
        const currentUser = JSON.parse(localStorage.getItem("quiz-app-user") || "{}")
        if (currentUser.id === quizData.created_by) {
          const newStats = {
            ...currentUser.stats,
            quizzesCreated: (currentUser.stats?.quizzesCreated || 0) + 1,
          }
          await DatabaseService.updateUserStats(currentUser.id, newStats)

          // Update local storage
          currentUser.stats = newStats
          localStorage.setItem("quiz-app-user", JSON.stringify(currentUser))
          window.dispatchEvent(new CustomEvent("userUpdated", { detail: currentUser }))
        }
      }

      return createdCode
    } catch (error) {
      console.error("Error creating quiz:", error)
      return null
    }
  }

  const getQuiz = async (code: string): Promise<Quiz | null> => {
    try {
      return await DatabaseService.getQuizByCode(code)
    } catch (error) {
      console.error("Error fetching quiz:", error)
      return null
    }
  }

  const submitQuizAnswer = async (quizCode: string, userId: string, userName: string, score: number) => {
    try {
      const quiz = await DatabaseService.getQuizByCode(quizCode)
      if (quiz) {
        await DatabaseService.submitScore(quiz.id, userId, userName, score)

        // Add to recent activity
        await DatabaseService.addRecentActivity(userId, quiz.id, quiz.title, quizCode, score)
      }
    } catch (error) {
      console.error("Error submitting quiz answer:", error)
    }
  }

  const getLeaderboard = async (quizCode: string): Promise<LeaderboardEntry[]> => {
    try {
      const quiz = await DatabaseService.getQuizByCode(quizCode)
      if (quiz) {
        return await DatabaseService.getLeaderboard(quiz.id)
      }
      return []
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      return []
    }
  }

  const getUserQuizzes = async (userId: string): Promise<Quiz[]> => {
    try {
      return await DatabaseService.getQuizzesByUser(userId)
    } catch (error) {
      console.error("Error fetching user quizzes:", error)
      return []
    }
  }

  return (
    <QuizContext.Provider
      value={{
        createQuiz,
        getQuiz,
        submitQuizAnswer,
        getLeaderboard,
        getUserQuizzes,
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
