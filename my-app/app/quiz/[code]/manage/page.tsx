"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, Share, Users, Trophy, Eye } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useQuiz } from "@/contexts/quiz-context"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function ManageQuizPage() {
  const { code } = useParams()
  const { user } = useAuth()
  const { getQuiz, getLeaderboard } = useQuiz()
  const router = useRouter()

  const [quiz, setQuiz] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [copied, setCopied] = useState(false)

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

  const quizUrl = `${window.location.origin}/quiz/${code}`

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code as string)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = code as string
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: quiz.title,
      text: `Join my quiz: ${quiz.title}`,
      url: quizUrl,
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(quizUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      // Final fallback
      const textArea = document.createElement("textarea")
      textArea.value = quizUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
            <h1 className="text-3xl font-bold text-black dark:text-white">Quiz Created Successfully!</h1>
            <p className="text-gray-600 dark:text-gray-300">{quiz.title}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quiz Code Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg text-center">
              <CardHeader>
                <CardTitle>Your Quiz Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-6xl font-bold font-mono text-black dark:text-white mb-4">{code}</div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Share this code with participants to join your quiz
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleCopyCode} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? "Copied!" : "Copy Code"}
                  </Button>
                  <Button onClick={handleShare}>
                    <Share className="w-4 h-4 mr-2" />
                    Share Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quiz Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6"
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
                <Eye className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{quiz.questions.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Questions</div>
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

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 justify-center"
          >
            <Button
              onClick={() => router.push(`/quiz/${code}/leaderboard`)}
              className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Leaderboard
            </Button>
            <Button variant="outline" onClick={() => router.push(`/quiz/${code}`)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview Quiz
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
