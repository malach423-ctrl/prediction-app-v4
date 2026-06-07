import { NextResponse } from 'next/server'

const API_KEY = process.env.FOOTBALL_DATA_API_KEY!
const BASE_URL = 'https://api.football-data.org/v4'

const COMPETITIONS = [
  'PL',   // Premier League
  'PD',   // La Liga
  'BL1',  // Bundesliga
  'SA',   // Serie A
  'FL1',  // Ligue 1
  'CL',   // Champions League
  'EL',   // Europa League
  'EC',   // European Championship
  'WC',   // World Cup
  'DED',  // Eredivisie
  'PPL',  // Primeira Liga
  'BSA',  // Brazilian Série A
]

async function fetchCompetitionMatches(code: string) {
  try {
    const res = await fetch(`${BASE_URL}/competitions/${code}/matches?status=LIVE,SCHEDULED,FINISHED&limit=10`, {
      headers: { 'X-Auth-Token': API_KEY },
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.matches || []
  } catch {
    return []
  }
}

function formatMatch(match: any) {
  const home = match.homeTeam?.shortName || match.homeTeam?.name || 'TBA'
  const away = match.awayTeam?.shortName || match.awayTeam?.name || 'TBA'
  const date = new Date(match.utcDate)
  const matchTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const matchDate = isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const status = match.status === 'IN_PLAY' || match.status === 'PAUSED' ? 'live' : match.status === 'FINISHED' ? 'finished' : 'scheduled'
  const score = match.score?.fullTime ? `${match.score.fullTime.home ?? '-'}-${match.score.fullTime.away ?? '-'}` : match.score?.halfTime?.home != null ? `${match.score.halfTime.home}-${match.score.halfTime.away}` : null

  return {
    id: match.id,
    home_team: home,
    away_team: away,
    match_time: matchTime,
    match_date: matchDate,
    league: match.competition?.name || 'Unknown',
    status,
    score,
    predictions: [{
      prediction_1: Math.floor(Math.random() * 30) + 30,
      prediction_x: Math.floor(Math.random() * 20) + 20,
      prediction_2: Math.floor(Math.random() * 30) + 20,
      goals_under: Math.floor(Math.random() * 20) + 35,
      goals_over: Math.floor(Math.random() * 20) + 45,
      correct_score: score || `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 3)}`,
      correct_score_odds: (Math.random() * 8 + 4).toFixed(2),
    }]
  }
}

function isToday(date: Date) {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isTomorrow(date: Date) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const league = searchParams.get('league') || 'All'

  try {
    const allMatches = await Promise.all(COMPETITIONS.map(fetchCompetitionMatches))
    let matches = allMatches.flat().map(formatMatch)

    // Sort: live first, then scheduled, then finished
    matches.sort((a, b) => {
      const order = { live: 0, scheduled: 1, finished: 2 }
      return order[a.status as keyof typeof order] - order[b.status as keyof typeof order]
    })

    if (league !== 'All') {
      matches = matches.filter(m => m.league === league)
    }

    const leagues = ['All', ...Array.from(new Set(allMatches.flat().map((m: any) => m.competition?.name).filter(Boolean))).sort()] as string[]

    return NextResponse.json({ matches, leagues })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}
