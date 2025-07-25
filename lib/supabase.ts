import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  email: string
  name: string
  type: "guest" | "registered"
  stats: {
    quizzesJoined: number
    quizzesCreated: number
    averageScore: number
    bestScore: number
  }
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: string
  code: string
  title: string
  description: string
  questions: Question[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

export interface LeaderboardEntry {
  id: string
  quiz_id: string
  user_id: string
  user_name: string
  score: number
  completed_at: string
}

export interface RecentActivity {
  id: string
  user_id: string
  quiz_id: string
  quiz_title: string
  quiz_code: string
  score: number
  created_at: string
}
