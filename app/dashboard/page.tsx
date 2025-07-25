"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Hash, Trophy, User, LogOut, Users, Target } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Dashboard() {
  const [quizCode, setQuizCode] = useState("")
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Fix: Wait for component to mount before redirecting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push("/")
    }
  }, [mounted, user, router])

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    if (quizCode.trim()) {
      router.push(`/quiz/${quizCode}`)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Show loading while checking auth
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
      </div>
    )
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-3xl font-bold text-black dark:text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Welcome back, {user.name}!
          </motion.h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={() => router.push("/profile")}
              className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className={`grid gap-6 mb-8 ${user.type === "registered" ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          {/* Join Quiz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="transition-transform duration-200"
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hash className="w-8 h-8 text-white dark:text-black" />
                </div>
                <CardTitle className="text-xl text-black dark:text-white">Join a Quiz</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Enter a quiz code to participate in real-time quizzes
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinQuiz} className="space-y-4">
                  <div>
                    <Label htmlFor="quiz-code" className="text-black dark:text-white">
                      Quiz Code
                    </Label>
                    <Input
                      id="quiz-code"
                      placeholder="Enter 6-digit code"
                      value={quizCode}
                      onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="text-center text-lg font-mono border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
                    disabled={quizCode.length !== 6}
                  >
                    Join Quiz
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Create Quiz - Only for registered users */}
          {user.type === "registered" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="transition-transform duration-200"
            >
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-white dark:text-black" />
                  </div>
                  <CardTitle className="text-xl text-black dark:text-white">Create a Quiz</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Design custom quizzes with multiple choice questions
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
                    onClick={() => router.push("/create-quiz")}
                  >
                    Create New Quiz
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Leaderboards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: user.type === "registered" ? 0.3 : 0.2 }}
            whileHover={{ y: -5 }}
            className="transition-transform duration-200"
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white dark:text-black" />
                </div>
                <CardTitle className="text-xl text-black dark:text-white">Leaderboards</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-sm">View rankings and compete with other players</p>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-black dark:text-white bg-transparent"
                  onClick={() => router.push("/profile")}
                >
                  View Your Stats
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Target className="w-5 h-5" />
                Your Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-black dark:text-white">{user.stats?.quizzesJoined || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Joined</div>
                </div>
                {user.type === "registered" && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {user.stats?.quizzesCreated || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Created</div>
                  </div>
                )}
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-black dark:text-white">{user.stats?.averageScore || 0}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-black dark:text-white">{user.stats?.bestScore || 0}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Best Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.recentActivity?.length ? (
                  user.recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div>
                        <div className="font-medium text-black dark:text-white">{activity.quizTitle}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Score: {activity.score}% • {activity.date}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/quiz/${activity.quizCode}/leaderboard`)}
                        className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                      >
                        View Leaderboard
                      </Button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No recent activity</h3>
                    <p className="text-gray-500 dark:text-gray-400">Join a quiz to get started!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
