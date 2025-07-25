"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award, ArrowLeft, Users, Target } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useQuiz } from "@/contexts/quiz-context"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function LeaderboardPage() {
  const { code } = useParams()
  const { user } = useAuth()
  const { getQuiz, getLeaderboard } = useQuiz()
  const router = useRouter()

  const [quiz, setQuiz] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    if (code) {
      const quizData = getQuiz(code as string)
      const leaderboardData = getLeaderboard(code as string)

      if (quizData) {
        setQuiz(quizData)
        setLeaderboard(leaderboardData)
      } else {
        router.push("/dashboard")
      }
    }
  }, [code, getQuiz, getLeaderboard, router])

  if (!user || !quiz) {
    return null
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</div>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-yellow-600"
      case 2:
        return "from-gray-300 to-gray-500"
      case 3:
        return "from-amber-400 to-amber-600"
      default:
        return "from-blue-400 to-blue-600"
    }
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
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Leaderboard</h1>
            <p className="text-gray-600 dark:text-gray-300">{quiz.title}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Quiz Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{leaderboard.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Participants</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg text-center">
              <CardContent className="p-6">
                <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {leaderboard.length > 0
                    ? Math.round(leaderboard.reduce((acc, entry) => acc + entry.score, 0) / leaderboard.length)
                    : 0}
                  %
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Average Score</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg text-center">
              <CardContent className="p-6">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {leaderboard.length > 0 ? Math.max(...leaderboard.map((entry) => entry.score)) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Highest Score</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                          entry.userId === user.id
                            ? "border-black dark:border-white bg-gray-50 dark:bg-gray-800"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          <div className="text-lg font-semibold">#{index + 1}</div>
                        </div>

                        <div className="flex-1">
                          <div className="font-medium">
                            {entry.userName}
                            {entry.userId === user.id && <span className="ml-2 text-sm text-blue-500">(You)</span>}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Completed: {new Date(entry.completedAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold">{entry.score}%</div>
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-black dark:bg-white`}
                              initial={{ width: 0 }}
                              animate={{ width: `${entry.score}%` }}
                              transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No participants yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Be the first to take this quiz!</p>
                    <Button
                      className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black mt-4"
                      onClick={() => router.push(`/quiz/${code}`)}
                    >
                      Take Quiz
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-4 mt-8"
          >
            <Button variant="outline" onClick={() => router.push(`/quiz/${code}`)}>
              Retake Quiz
            </Button>
            <Button
              className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
              onClick={async () => {
                const shareData = {
                  title: quiz.title,
                  text: `Join my quiz: ${quiz.title}`,
                  url: `${window.location.origin}/quiz/${code}`,
                }

                try {
                  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    await navigator.share(shareData)
                  } else {
                    await navigator.clipboard.writeText(`${window.location.origin}/quiz/${code}`)
                    // Could add a toast notification here
                  }
                } catch (err) {
                  // Fallback
                  const textArea = document.createElement("textarea")
                  textArea.value = `${window.location.origin}/quiz/${code}`
                  document.body.appendChild(textArea)
                  textArea.select()
                  document.execCommand("copy")
                  document.body.removeChild(textArea)
                }
              }}
            >
              Share Quiz
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
