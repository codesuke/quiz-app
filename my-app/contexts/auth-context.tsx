"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  type: "guest" | "registered"
  stats?: {
    quizzesJoined: number
    quizzesCreated: number
    averageScore: number
    bestScore: number
  }
  recentActivity?: Array<{
    quizTitle: string
    quizCode: string
    score: number
    date: string
  }>
  createdQuizzes?: Array<{
    code: string
    title: string
    createdAt: string
  }>
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginAsGuest: () => void
  logout: () => void
  updateUserStats: (stats: Partial<User["stats"]>, newActivity?: any) => void
  refreshUserData: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem("quiz-app-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    // Listen for user updates from quiz creation
    const handleUserUpdate = (event: CustomEvent) => {
      setUser(event.detail)
    }

    window.addEventListener("userUpdated", handleUserUpdate as EventListener)

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    // Save user to localStorage whenever user changes
    if (user) {
      localStorage.setItem("quiz-app-user", JSON.stringify(user))
    } else {
      localStorage.removeItem("quiz-app-user")
    }
  }, [user])

  // Add a function to refresh user data
  const refreshUserData = () => {
    const savedUser = localStorage.getItem("quiz-app-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }

  // Update the updateUserStats function to also handle quiz completion
  const updateUserStats = (newStats: Partial<User["stats"]>, newActivity?: any) => {
    if (user) {
      const updatedUser = {
        ...user,
        stats: {
          ...user.stats,
          ...newStats,
        },
        recentActivity: newActivity ? [newActivity, ...(user.recentActivity || []).slice(0, 4)] : user.recentActivity,
      }
      setUser(updatedUser)
    }
  }

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would call an API
    const mockUser: User = {
      id: `user_${Date.now()}`,
      name: email.split("@")[0],
      email,
      type: "registered",
      stats: {
        quizzesJoined: 5,
        quizzesCreated: 2,
        averageScore: 78,
        bestScore: 95,
      },
      recentActivity: [
        {
          quizTitle: "JavaScript Basics",
          quizCode: "ABC123",
          score: 85,
          date: "2024-01-15",
        },
        {
          quizTitle: "React Fundamentals",
          quizCode: "DEF456",
          score: 92,
          date: "2024-01-14",
        },
      ],
      createdQuizzes: [
        {
          code: "XYZ789",
          title: "My First Quiz",
          createdAt: "2024-01-10",
        },
      ],
    }
    setUser(mockUser)
  }

  const register = async (name: string, email: string, password: string) => {
    // Mock registration - in real app, this would call an API
    const mockUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      type: "registered",
      stats: {
        quizzesJoined: 0,
        quizzesCreated: 0,
        averageScore: 0,
        bestScore: 0,
      },
      recentActivity: [],
      createdQuizzes: [],
    }
    setUser(mockUser)
  }

  const loginAsGuest = () => {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      name: "Guest User",
      email: "",
      type: "guest",
      stats: {
        quizzesJoined: 0,
        quizzesCreated: 0,
        averageScore: 0,
        bestScore: 0,
      },
      recentActivity: [],
    }
    setUser(guestUser)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginAsGuest,
        logout,
        updateUserStats,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
