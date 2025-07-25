// Add proper data persistence layer
export class QuizStorage {
  private static instance: QuizStorage

  static getInstance(): QuizStorage {
    if (!QuizStorage.instance) {
      QuizStorage.instance = new QuizStorage()
    }
    return QuizStorage.instance
  }

  // In production, replace with database calls
  async saveQuiz(quiz: any): Promise<string> {
    // For now, use localStorage, but in production use a database
    const quizzes = JSON.parse(localStorage.getItem("quiz-app-quizzes") || "[]")
    quizzes.push(quiz)
    localStorage.setItem("quiz-app-quizzes", JSON.stringify(quizzes))
    return quiz.code
  }

  async getQuiz(code: string): Promise<any> {
    const quizzes = JSON.parse(localStorage.getItem("quiz-app-quizzes") || "[]")
    return quizzes.find((q: any) => q.code === code)
  }

  async saveLeaderboard(code: string, entry: any): Promise<void> {
    const leaderboards = JSON.parse(localStorage.getItem("quiz-app-leaderboards") || "{}")
    if (!leaderboards[code]) leaderboards[code] = []

    const existingIndex = leaderboards[code].findIndex((e: any) => e.userId === entry.userId)
    if (existingIndex >= 0 && entry.score > leaderboards[code][existingIndex].score) {
      leaderboards[code][existingIndex] = entry
    } else if (existingIndex === -1) {
      leaderboards[code].push(entry)
    }

    leaderboards[code].sort((a: any, b: any) => b.score - a.score)
    localStorage.setItem("quiz-app-leaderboards", JSON.stringify(leaderboards))
  }
}
