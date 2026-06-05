import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Match = {
  id: string
  home_team: string
  away_team: string
  match_time: string
  match_date: string
  league: string
  predictions: Prediction[]
}

export type Prediction = {
  id: string
  match_id: string
  prediction_1: number
  prediction_x: number
  prediction_2: number
  goals_under: number
  goals_over: number
  correct_score: string
  correct_score_odds: number
  updated_at: string
}

export async function getMatchesWithPredictions(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`*, predictions(*)`)
    .order('match_time', { ascending: true })

  if (error) throw error
  return data as Match[]
}
