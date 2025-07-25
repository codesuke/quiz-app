"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { DatabaseService } from "@/lib/database"
import type { User } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount (for demo purposes)
    const savedUser = localStorage.getItem("quiz-app-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Save user to localStorage whenever user changes
    if (user) {
      localStorage.setItem("quiz-app-user", JSON.stringify(user))
    } else {
      localStorage.removeItem("quiz-app-user")
    }
  }, [user])

  const refreshUserData = useCallback(() => {
    const savedUser = localStorage.getItem("quiz-app-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const updateUserStats = useCallback(
    async (newStats: Partial<User["stats"]>, newActivity?: any) => {
      if (user) {
        const updatedStats = { ...user.stats, ...newStats }

        // Update in database
        await DatabaseService.updateUserStats(user.id, updatedStats)

        // Add recent activity if provided
        if (newActivity) {
          await DatabaseService.addRecentActivity(
            user.id,
            newActivity.quizId || "",
            newActivity.quizTitle,
            newActivity.quizCode,
            newActivity.score,
          )
        }

        const updatedUser = {
          ...user,
          stats: updatedStats,
        }
        setUser(updatedUser)
      }
    },
    [user],
  )

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // In a real app, you'd validate password here
      let userData = await DatabaseService.getUserByEmail(email)

      if (!userData) {
        // Create user if doesn't exist (for demo)
        userData = await DatabaseService.createUser(email, email.split("@")[0], "registered")
        if (!userData) {
          throw new Error("Failed to create user account")
        }
      }

      setUser(userData)
    } catch (error) {
      console.error("Login error:", error)
      throw new Error("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      // Check if user already exists
      const existingUser = await DatabaseService.getUserByEmail(email)
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      const userData = await DatabaseService.createUser(email, name, "registered")
      if (!userData) {
        throw new Error("Failed to create account")
      }

      setUser(userData)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setLoading(false)
    }
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
        loading,
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
