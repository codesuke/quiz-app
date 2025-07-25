"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/quiz-context"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

export default function CreateQuiz() {
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ])
  const { user } = useAuth()
  const { createQuiz } = useQuiz()
  const router = useRouter()

  if (!user || user.type !== "registered") {
    router.push("/dashboard")
    return null
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) } : q,
      ),
    )
  }

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      alert("Please enter a quiz title")
      return
    }

    const validQuestions = questions.filter((q) => q.question.trim() && q.options.every((opt) => opt.trim()))

    if (validQuestions.length === 0) {
      alert("Please add at least one complete question")
      return
    }

    const quizCode = await createQuiz({
      title: quizTitle,
      description: quizDescription,
      questions: validQuestions,
      created_by: user.id,
    })

    if (quizCode) {
      router.push(`/quiz/${quizCode}/manage`)
    } else {
      alert("Failed to create quiz. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-black dark:text-white">Create New Quiz</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quiz Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Quiz Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-black dark:text-white">
                    Quiz Title
                  </Label>
                  <Input
                    id="title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title"
                    className="border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-black dark:text-white">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Brief description of your quiz"
                    rows={3}
                    className="border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((question, questionIndex) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: questionIndex * 0.1 }}
              >
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg text-black dark:text-white">Question {questionIndex + 1}</CardTitle>
                    {questions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-black dark:text-white">Question</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                        placeholder="Enter your question"
                        rows={2}
                        className="border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-black dark:text-white">Answer Options</Label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(question.id, "correctAnswer", optionIndex)}
                            className="text-green-500"
                          />
                          <Input
                            value={option}
                            onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1 border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white"
                          />
                          <span className="text-sm text-gray-500 min-w-[80px]">
                            {question.correctAnswer === optionIndex ? "Correct" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Add Question Button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Button
              variant="outline"
              onClick={addQuestion}
              className="w-full border-dashed border-2 border-gray-300 dark:border-gray-700 h-16 text-lg bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-black dark:text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Question
            </Button>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end gap-4"
          >
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveQuiz}
              className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Quiz
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
