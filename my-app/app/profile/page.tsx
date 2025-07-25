"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy, Target, Calendar, Award } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const { user, refreshUserData } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Refresh user data when component mounts to ensure latest info
    if (refreshUserData) {
      refreshUserData()
    }
  }, [refreshUserData])

  if (!user) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-black dark:text-white">Profile</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-black dark:text-white">{user.name}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.type} User</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-500">{user.stats?.quizzesJoined || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Quizzes Joined</div>
                  </div>

                  {user.type === "registered" && (
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-500">{user.stats?.quizzesCreated || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Quizzes Created</div>
                    </div>
                  )}

                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-500">{user.stats?.averageScore || 0}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Average Score</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-500">{user.stats?.bestScore || 0}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Best Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {user.recentActivity?.length ? (
                  <div className="space-y-4">
                    {user.recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div>
                          <div className="font-medium text-black dark:text-white">{activity.quizTitle}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{activity.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-500">{activity.score}%</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/quiz/${activity.quizCode}/leaderboard`)}
                          >
                            View Leaderboard
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No activity yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Start taking quizzes to see your activity here
                    </p>
                    <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Created Quizzes (for registered users) */}
          {user.type === "registered" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle>Your Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.createdQuizzes?.length ? (
                    <div className="space-y-4">
                      {user.createdQuizzes.map((quiz, index) => (
                        <motion.div
                          key={quiz.code}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <div>
                            <div className="font-medium text-black dark:text-white">{quiz.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              Code: {quiz.code} • Created: {quiz.createdAt}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/quiz/${quiz.code}/leaderboard`)}
                            >
                              Leaderboard
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.share?.({
                                  title: quiz.title,
                                  text: `Join my quiz: ${quiz.title}`,
                                  url: `${window.location.origin}/quiz/${quiz.code}`,
                                }) || navigator.clipboard.writeText(`${window.location.origin}/quiz/${quiz.code}`)
                              }}
                            >
                              Share
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                        No quizzes created yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Create your first quiz to engage with others
                      </p>
                      <Button onClick={() => router.push("/create-quiz")}>Create Quiz</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
