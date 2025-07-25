"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Trophy } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useQuiz } from "@/contexts/quiz-context"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function QuizPage() {
  const { code } = useParams()
  const { user } = useAuth()
  const { getQuiz, submitQuizAnswer, updateUserStats } = useQuiz()
  const router = useRouter()

  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (code) {
      const quizData = getQuiz(code as string)
      if (quizData) {
        setQuiz(quizData)
      } else {
        router.push("/dashboard")
      }
    }
  }, [code, getQuiz, router])

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quizStarted) {
      handleNextQuestion()
    }
  }, [timeLeft, quizStarted, quizCompleted])

  if (!user || !quiz) {
    return null
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setTimeLeft(30)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    const newAnswers = [...answers, selectedAnswer ?? -1]
    setAnswers(newAnswers)

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setTimeLeft(30)
    } else {
      // Quiz completed
      const finalScore = calculateScore(newAnswers)
      setScore(finalScore)
      setQuizCompleted(true)
      submitQuizAnswer(code as string, user.id, finalScore)

      // Update user stats and activity
      const newActivity = {
        quizTitle: quiz.title,
        quizCode: code as string,
        score: finalScore,
        date: new Date().toLocaleDateString(),
      }

      const currentStats = user.stats || { quizzesJoined: 0, quizzesCreated: 0, averageScore: 0, bestScore: 0 }
      const newQuizzesJoined = currentStats.quizzesJoined + 1
      const newAverageScore = Math.round(
        (currentStats.averageScore * currentStats.quizzesJoined + finalScore) / newQuizzesJoined,
      )
      const newBestScore = Math.max(currentStats.bestScore, finalScore)

      updateUserStats(
        {
          quizzesJoined: newQuizzesJoined,
          averageScore: newAverageScore,
          bestScore: newBestScore,
        },
        newActivity,
      )
    }
  }

  const calculateScore = (userAnswers: number[]) => {
    const correct = userAnswers.reduce((acc, answer, index) => {
      return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0)
    }, 0)
    return Math.round((correct / quiz.questions.length) * 100)
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4 text-black dark:text-white">{quiz.title}</CardTitle>
              {quiz.description && <p className="text-gray-600 dark:text-gray-400 mb-6">{quiz.description}</p>}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{quiz.questions.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">30s</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Per Question</div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">{code}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Quiz Code</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button
                size="lg"
                onClick={handleStartQuiz}
                className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-8 py-3"
              >
                Start Quiz
              </Button>
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg text-center">
            <CardHeader>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <CardTitle className="text-3xl mb-2 text-black dark:text-white">Quiz Completed!</CardTitle>
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                {score}%
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                You scored {answers.filter((answer, index) => answer === quiz.questions[index].correctAnswer).length}{" "}
                out of {quiz.questions.length} questions correctly
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push(`/quiz/${code}/leaderboard`)}
                  className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Quiz
            </Button>
            <h1 className="text-xl font-semibold text-black dark:text-white">{quiz.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-black dark:text-white">{currentQ.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <motion.button
                      key={index}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        selectedAnswer === index
                          ? "border-black dark:border-white bg-gray-50 dark:bg-gray-800"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswer === index
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {selectedAnswer === index && <div className="w-3 h-3 bg-white rounded-full" />}
                        </div>
                        <span>{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            size="lg"
            className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
          >
            {currentQuestion === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
          </Button>
        </div>
      </div>
    </div>
  )
}
