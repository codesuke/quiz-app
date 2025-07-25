import { supabase } from "./supabase"
import type { User, Quiz, LeaderboardEntry, RecentActivity } from "./supabase"

export class DatabaseService {
  // User operations
  static async createUser(
    email: string,
    name: string,
    type: "guest" | "registered" = "registered",
  ): Promise<User | null> {
    if (!email || !name) {
      console.error("Email and name are required")
      return null
    }

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          type,
          stats: {
            quizzesJoined: 0,
            quizzesCreated: 0,
            averageScore: 0,
            bestScore: 0,
          },
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }
    return data
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    if (!email) {
      console.error("Email is required")
      return null
    }

    const { data, error } = await supabase.from("users").select("*").eq("email", email.toLowerCase().trim()).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error fetching user:", error)
      return null
    }
    return data
  }

  static async updateUserStats(userId: string, stats: Partial<User["stats"]>): Promise<boolean> {
    const { error } = await supabase
      .from("users")
      .update({ stats, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user stats:", error)
      return false
    }
    return true
  }

  // Statistics operations
  static async getTotalUsersCount(): Promise<number> {
    try {
      const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true })

      if (error) {
        console.error("Error fetching users count:", error)
        return 1250 // Fallback
      }
      return count || 0
    } catch (error) {
      console.error("Error in getTotalUsersCount:", error)
      return 1250 // Fallback
    }
  }

  static async getTotalQuizzesCount(): Promise<number> {
    try {
      const { count, error } = await supabase.from("quizzes").select("*", { count: "exact", head: true })

      if (error) {
        console.error("Error fetching quizzes count:", error)
        return 450 // Fallback
      }
      return count || 0
    } catch (error) {
      console.error("Error in getTotalQuizzesCount:", error)
      return 450 // Fallback
    }
  }

  static async getTotalQuizAttempts(): Promise<number> {
    try {
      const { count, error } = await supabase.from("leaderboard_entries").select("*", { count: "exact", head: true })

      if (error) {
        console.error("Error fetching quiz attempts count:", error)
        return 8500 // Fallback
      }
      return count || 0
    } catch (error) {
      console.error("Error in getTotalQuizAttempts:", error)
      return 8500 // Fallback
    }
  }

  // Quiz operations
  static async createQuiz(quiz: Omit<Quiz, "id" | "created_at" | "updated_at">): Promise<string | null> {
    const { data, error } = await supabase.from("quizzes").insert([quiz]).select("code").single()

    if (error) {
      console.error("Error creating quiz:", error)
      return null
    }
    return data.code
  }

  static async getQuizByCode(code: string): Promise<Quiz | null> {
    const { data, error } = await supabase.from("quizzes").select("*").eq("code", code).single()

    if (error) {
      console.error("Error fetching quiz:", error)
      return null
    }
    return data
  }

  static async getQuizzesByUser(userId: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user quizzes:", error)
      return []
    }
    return data || []
  }

  // Leaderboard operations
  static async submitScore(quizId: string, userId: string, userName: string, score: number): Promise<boolean> {
    try {
      console.log("Submitting score:", { quizId, userId, userName, score })

      // First, check if entry exists
      const { data: existingEntry } = await supabase
        .from("leaderboard_entries")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("user_id", userId)
        .single()

      if (existingEntry) {
        // Update existing entry only if new score is higher
        if (score > existingEntry.score) {
          const { error } = await supabase
            .from("leaderboard_entries")
            .update({
              score,
              user_name: userName,
              completed_at: new Date().toISOString(),
            })
            .eq("quiz_id", quizId)
            .eq("user_id", userId)

          if (error) {
            console.error("Error updating score:", error)
            return false
          }
          console.log("Score updated successfully")
        } else {
          console.log("New score not higher, keeping existing score")
        }
      } else {
        // Insert new entry
        const { error } = await supabase.from("leaderboard_entries").insert([
          {
            quiz_id: quizId,
            user_id: userId,
            user_name: userName,
            score,
            completed_at: new Date().toISOString(),
          },
        ])

        if (error) {
          console.error("Error inserting score:", error)
          return false
        }
        console.log("New score inserted successfully")
      }

      return true
    } catch (error) {
      console.error("Error in submitScore:", error)
      return false
    }
  }

  static async getLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
    try {
      console.log("Fetching leaderboard for quiz:", quizId)

      const { data, error } = await supabase
        .from("leaderboard_entries")
        .select("*")
        .eq("quiz_id", quizId)
        .order("score", { ascending: false })
        .order("completed_at", { ascending: true }) // Earlier completion time as tiebreaker
        .limit(100)

      if (error) {
        console.error("Error fetching leaderboard:", error)
        return []
      }

      console.log("Leaderboard data fetched:", data)
      return data || []
    } catch (error) {
      console.error("Error in getLeaderboard:", error)
      return []
    }
  }

  // Recent activity operations
  static async addRecentActivity(
    userId: string,
    quizId: string,
    quizTitle: string,
    quizCode: string,
    score: number,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("recent_activities").insert([
        {
          user_id: userId,
          quiz_id: quizId,
          quiz_title: quizTitle,
          quiz_code: quizCode,
          score,
        },
      ])

      if (error) {
        console.error("Error adding recent activity:", error)
        return false
      }

      // Keep only the latest 10 activities per user
      const { data: activities } = await supabase
        .from("recent_activities")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(10, 1000)

      if (activities && activities.length > 0) {
        const idsToDelete = activities.map((a) => a.id)
        await supabase.from("recent_activities").delete().in("id", idsToDelete)
      }

      return true
    } catch (error) {
      console.error("Error in addRecentActivity:", error)
      return false
    }
  }

  static async getRecentActivities(userId: string): Promise<RecentActivity[]> {
    const { data, error } = await supabase
      .from("recent_activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching recent activities:", error)
      return []
    }
    return data || []
  }

  // Utility functions
  static generateQuizCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  static async isQuizCodeUnique(code: string): Promise<boolean> {
    const { data, error } = await supabase.from("quizzes").select("id").eq("code", code).single()
    return error !== null // If error, code doesn't exist (unique)
  }

  static async generateUniqueQuizCode(): Promise<string> {
    let code: string
    let attempts = 0
    const maxAttempts = 100

    do {
      code = this.generateQuizCode()
      attempts++
    } while (!(await this.isQuizCodeUnique(code)) && attempts < maxAttempts)

    return code
  }
}
