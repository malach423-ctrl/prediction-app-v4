'use client'

import { useState, useEffect, useCallback } from 'react'
import { Match, supabase } from '@/lib/supabase'
import PredictionTable from './PredictionTable'

const LEAGUES = ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1']

const LEAGUE_COLORS: Record<string, string> = {
  'Premier League': '#3d195b',
  'La Liga': '#ee8707',
  'Bundesliga': '#d4011d',
  'Serie A': '#1a1a18',
  'Ligue 1': '#0a1e4e',
}

export default function PredictionClient({
  initialMatches,
  leagues,
}: {
  initialMatches: Match[]
  leagues: string[]
}) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [selectedLeague, setSelectedLeague] = useState('All')
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const fetchMatches = useCallback(async (league: string) => {
    setRefreshing(true)
    try {
      let query = supabase
        .from('matches')
        .select(`*, predictions(*)`)
        .order('match_time', { ascending: true })

      if (league !== 'All') {
        query = query.eq('league', league)
      }

      const { data } = await query
      if (data) {
        setMatches(data as Match[])
        setLastUpdated(new Date())
      }
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatches(selectedLeague)
    }, 60000)
    return () => clearInterval(interval)
  }, [selectedLeague, fetchMatches])

  const handleLeagueChange = (league: string) => {
    setSelectedLeague(league)
    fetchMatches(league)
  }

  const filteredLeagues = leagues.length > 0 ? leagues : LEAGUES

  return (
    <div>
      {/* League filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filteredLeagues.map((league) => {
            const active = selectedLeague === league
            const color = LEAGUE_COLORS[league] || '#1a1a18'
            return (
              <button
                key={league}
                onClick={() => handleLeagueChange(league)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '20px',
                  border: `0.5px solid ${active ? color : '#d3d1c7'}`,
                  background: active ? color : '#fff',
                  color: active ? '#fff' : '#5f5e5a',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {league}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: '10px', color: '#b4b2a9', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {refreshing && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#639922', display: 'inline-block', animation: 'pulse 1s infinite' }} />}
          Updated {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888780', background: '#fff', borderRadius: '12px', border: '0.5px solid #d3d1c7' }}>
          No matches found for {selectedLeague}
        </div>
      ) : (
        <PredictionTable matches={matches} />
      )}
    </div>
  )
}
