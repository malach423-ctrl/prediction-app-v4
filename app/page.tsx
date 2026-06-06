import { getMatchesWithPredictions, Match } from '@/lib/supabase'
import PredictionTable from '@/components/PredictionTable'

export const dynamic = 'force-dynamic'

export default async function Home() {
