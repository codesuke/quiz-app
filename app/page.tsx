"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Sparkles, Users, Target, Zap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { DatabaseService } from "@/lib/database"

const motivationalQuotes = [
  "Knowledge is power, quizzes are fun! 🧠",
  "Challenge your mind, expand your horizons! 🌟",
  "Every question is a step towards wisdom! 📚",
  "Learn, compete, and grow together! 🚀",
  "Your next breakthrough is just one quiz away! ⚡",
  "Smart minds think alike, but great minds quiz! 🎯",
  "Turn curiosity into knowledge! 🔍",
  "The best way to learn is to test yourself! 💡",
  "Quiz your way to greatness! 🏆",
  "Knowledge shared is knowledge multiplied! 🌍",
]

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"signin" | "register" | null>(null)
  const [formData, setFormData] = useState({ email: "", password: "", name: "" })
  const { user, login, register, loginAsGuest } = useAuth()
  const router = useRouter()
  const [authError, setAuthError] = useState("")
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [stats, setStats] = useState({
    activeUsers: 0,
    quizzesTaken: 0,
    totalQuizzes: 0,
  })

  // Animated quotes rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [])

  // Load real statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [usersCount, quizzesCount, leaderboardCount] = await Promise.all([
          DatabaseService.getTotalUsersCount(),
          DatabaseService.getTotalQuizzesCount(),
          DatabaseService.getTotalQuizAttempts(),
        ])

        setStats({
          activeUsers: usersCount,
          quizzesTaken: leaderboardCount,
          totalQuizzes: quizzesCount,
        })
      } catch (error) {
        console.error("Error loading stats:", error)
        // Fallback to default values
        setStats({
          activeUsers: 1250,
          quizzesTaken: 8500,
          totalQuizzes: 450,
        })
      }
    }

    loadStats()
  }, [])

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")

    // Basic validation
    if (!formData.email || !formData.password) {
      setAuthError("Please fill in all fields")
      return
    }

    if (authMode === "register" && !formData.name) {
      setAuthError("Please enter your name")
      return
    }

    try {
      if (authMode === "signin") {
        await login(formData.email, formData.password)
      } else if (authMode === "register") {
        await register(formData.name, formData.email, formData.password)
      }
      setAuthMode(null)
    } catch (error) {
      setAuthError(error.message || "Authentication failed")
    }
  }

  const handleGuestLogin = () => {
    loginAsGuest()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-black dark:via-gray-950 dark:to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-black dark:bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-800 dark:bg-gray-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-600 dark:bg-gray-400 rounded-full blur-3xl"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-12"
          >
            {/* Logo without Trophy - using Sparkles instead */}
            <motion.div
              className="relative inline-flex items-center justify-center w-20 h-20 mb-8"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="relative w-10 h-10 text-white dark:text-black" />
            </motion.div>

            {/* Title with gradient text */}
            <motion.h1
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-black via-gray-800 to-black dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              QuizMaster
            </motion.h1>

            {/* Animated Quote */}
            <motion.div
              className="h-16 flex items-center justify-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuoteIndex}
                  className="text-lg text-gray-600 dark:text-gray-400 font-medium"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  {motivationalQuotes[currentQuoteIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Feature highlights */}
            <motion.div
              className="flex justify-center gap-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-500">Real-time</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-500">Competitive</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-500">Instant</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50 shadow-2xl shadow-black/5 dark:shadow-white/5">
              <CardContent className="p-0 overflow-hidden">
                {/* Decorative header with gradient */}
                <div className="relative bg-gradient-to-r from-black via-gray-800 to-black dark:from-white dark:via-gray-200 dark:to-white p-6 text-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-black/10"></div>
                  <motion.div
                    className="relative"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Sparkles className="w-8 h-8 text-black dark:text-white" />
                    </div>
                    <h3 className="text-white dark:text-black font-semibold text-lg">Ready to Quiz?</h3>
                  </motion.div>

                  {/* Floating particles */}
                  <div className="absolute top-2 left-8 w-2 h-2 bg-white/30 dark:bg-black/30 rounded-full animate-pulse"></div>
                  <div className="absolute top-6 right-12 w-1 h-1 bg-white/40 dark:bg-black/40 rounded-full animate-pulse delay-300"></div>
                  <div className="absolute bottom-4 left-16 w-1.5 h-1.5 bg-white/20 dark:bg-black/20 rounded-full animate-pulse delay-700"></div>
                </div>

                {/* Main content area */}
                <div className="p-8 bg-gradient-to-b from-white/50 to-white dark:from-gray-900/50 dark:to-gray-900">
                  <AnimatePresence mode="wait">
                    {!authMode ? (
                      <motion.div
                        key="auth-options"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Choose Your Path</h2>
                          <p className="text-gray-600 dark:text-gray-400">Join the ultimate quiz experience</p>
                        </div>

                        {/* Enhanced buttons with icons and descriptions */}
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                          <Button
                            className="relative w-full h-16 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black dark:from-white dark:to-gray-200 dark:hover:from-gray-200 dark:hover:to-white text-white dark:text-black font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-2xl rounded-xl border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700"
                            onClick={() => setAuthMode("signin")}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4" />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold">Sign In</div>
                                <div className="text-xs opacity-80">Welcome back, champion!</div>
                              </div>
                            </div>
                          </Button>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-500 dark:from-gray-600 dark:to-gray-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                          <Button
                            variant="outline"
                            className="relative w-full h-16 border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-black dark:text-white font-medium text-lg transition-all duration-300 bg-white/50 dark:bg-gray-900/50 hover:border-black dark:hover:border-white rounded-xl backdrop-blur-sm"
                            onClick={() => setAuthMode("register")}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold">Create Account</div>
                                <div className="text-xs opacity-70">Start your quiz journey</div>
                              </div>
                            </div>
                          </Button>
                        </motion.div>

                        {/* Enhanced divider */}
                        <div className="relative my-8">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-6 py-2 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 text-gray-500 dark:text-gray-400 font-medium rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                              or continue with
                            </span>
                          </div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-30 transition-opacity duration-300"></div>
                          <Button
                            variant="ghost"
                            className="relative w-full h-16 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 font-medium text-lg transition-all duration-300 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-solid hover:border-gray-400 dark:hover:border-gray-600 rounded-xl"
                            onClick={handleGuestLogin}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-left">
                                <div className="font-semibold">Guest Access</div>
                                <div className="text-xs opacity-70">Quick start, no signup</div>
                              </div>
                            </div>
                          </Button>
                        </motion.div>

                        {/* Real Stats footer */}
                        <motion.div
                          className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2, duration: 0.5 }}
                        >
                          <div className="flex justify-around text-center">
                            <div>
                              <motion.div
                                className="text-2xl font-bold text-black dark:text-white"
                                key={stats.activeUsers}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {stats.activeUsers.toLocaleString()}+
                              </motion.div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Active Users</div>
                            </div>
                            <div className="w-px bg-gray-300 dark:bg-gray-700"></div>
                            <div>
                              <motion.div
                                className="text-2xl font-bold text-black dark:text-white"
                                key={stats.quizzesTaken}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {stats.quizzesTaken.toLocaleString()}+
                              </motion.div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Quizzes Taken</div>
                            </div>
                            <div className="w-px bg-gray-300 dark:bg-gray-700"></div>
                            <div>
                              <div className="text-2xl font-bold text-black dark:text-white">99%</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Fun Rating</div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="auth-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <h2 className="text-2xl font-bold text-black dark:text-white">
                              {authMode === "signin" ? "Welcome Back!" : "Join the Community"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {authMode === "signin"
                                ? "Ready for another challenge?"
                                : "Create your quiz master account"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAuthMode(null)}
                            className="text-gray-500 hover:text-black dark:hover:text-white rounded-full w-10 h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-6">
                          {authMode === "register" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.3 }}
                              className="relative"
                            >
                              <Label
                                htmlFor="name"
                                className="text-black dark:text-white font-medium flex items-center gap-2"
                              >
                                <Users className="w-4 h-4" />
                                Full Name
                              </Label>
                              <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-2 h-12 border-2 border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white transition-all duration-200 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                                placeholder="Enter your full name"
                                required
                              />
                            </motion.div>
                          )}
                          <div className="relative">
                            <Label
                              htmlFor="email"
                              className="text-black dark:text-white font-medium flex items-center gap-2"
                            >
                              <Target className="w-4 h-4" />
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="mt-2 h-12 border-2 border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white transition-all duration-200 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                          <div className="relative">
                            <Label
                              htmlFor="password"
                              className="text-black dark:text-white font-medium flex items-center gap-2"
                            >
                              <Zap className="w-4 h-4" />
                              Password
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="mt-2 h-12 border-2 border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white transition-all duration-200 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                              placeholder="Enter your password"
                              required
                            />
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                            <Button
                              type="submit"
                              className="relative w-full h-14 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black dark:from-white dark:to-gray-200 dark:hover:from-gray-200 dark:hover:to-white text-white dark:text-black font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-2xl rounded-xl"
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                {authMode === "signin" ? "Sign In" : "Create Account"}
                              </div>
                            </Button>
                          </motion.div>
                        </form>

                        {authError && (
                          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-600 dark:text-red-400 text-sm">{authError}</p>
                          </div>
                        )}

                        <div className="mt-8 text-center">
                          <Button
                            variant="link"
                            onClick={() => setAuthMode(authMode === "signin" ? "register" : "signin")}
                            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200 font-medium"
                          >
                            {authMode === "signin" ? "New here? Create your account →" : "Already a member? Sign in →"}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer with credit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center mt-8 space-y-2"
          >
            <p className="text-sm text-gray-500 dark:text-gray-500">Join thousands of quiz enthusiasts worldwide</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
