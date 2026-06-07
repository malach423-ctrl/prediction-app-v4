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
  status: string
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

export async function getMatchesWithPredictions(league?: string): Promise<Match[]> {
  let query = supabase
    .from('matches')
    .select(`*, predictions(*)`)
    .order('match_time', { ascending: true })

  if (league && league !== 'All') {
    query = query.eq('league', league)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Match[]
}

export async function getLeagues(): Promise<string[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('league')
  if (error) throw error
  const leagues = [...new Set(data.map((m: any) => m.league))] as string[]
  return ['All', ...leagues.sort()]
}

export async function deleteMatch(id: string) {
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) throw error
}

export async function upsertPrediction(prediction: Omit<Prediction, 'id' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('predictions')
    .upsert({ ...prediction, updated_at: new Date().toISOString() }, { onConflict: 'match_id' })
    .select().single()
  if (error) throw error
  return data
}
