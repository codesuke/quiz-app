"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Trophy } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"signin" | "register" | null>(null)
  const [formData, setFormData] = useState({ email: "", password: "", name: "" })
  const { user, login, register, loginAsGuest } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (authMode === "signin") {
        await login(formData.email, formData.password)
      } else if (authMode === "register") {
        await register(formData.name, formData.email, formData.password)
      }
      setAuthMode(null)
    } catch (error) {
      console.error("Auth error:", error)
    }
  }

  const handleGuestLogin = () => {
    loginAsGuest()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white rounded-full mb-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trophy className="w-8 h-8 text-white dark:text-black" />
          </motion.div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">QuizMaster</h1>
          <p className="text-gray-600 dark:text-gray-400">Interactive quiz platform for everyone</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {!authMode ? (
                  <motion.div
                    key="auth-options"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-semibold text-center text-black dark:text-white mb-6">Get Started</h2>

                    <Button
                      className="w-full h-12 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-medium transition-all duration-200"
                      onClick={() => setAuthMode("signin")}
                    >
                      Sign In
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full h-12 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-black dark:text-white font-medium transition-all duration-200 bg-transparent"
                      onClick={() => setAuthMode("register")}
                    >
                      Create Account
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">or</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full h-12 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all duration-200"
                      onClick={handleGuestLogin}
                    >
                      Continue as Guest
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="auth-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-semibold text-black dark:text-white">
                        {authMode === "signin" ? "Sign In" : "Create Account"}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAuthMode(null)}
                        className="text-gray-500 hover:text-black dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                      {authMode === "register" && (
                        <div>
                          <Label htmlFor="name" className="text-black dark:text-white">
                            Name
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white"
                            required
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="email" className="text-black dark:text-white">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-1 border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-black dark:text-white">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="mt-1 border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-medium"
                      >
                        {authMode === "signin" ? "Sign In" : "Create Account"}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <Button
                        variant="link"
                        onClick={() => setAuthMode(authMode === "signin" ? "register" : "signin")}
                        className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                      >
                        {authMode === "signin"
                          ? "Don't have an account? Create one"
                          : "Already have an account? Sign in"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
