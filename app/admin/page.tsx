'use client'

import { useState, useEffect } from 'react'
import { Match, supabase, deleteMatch } from '@/lib/supabase'

const LEAGUES = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1']

const emptyForm = {
  home_team: '', away_team: '', match_time: '', match_date: 'Today', league: 'Premier League', status: 'scheduled',
  prediction_1: 33, prediction_x: 33, prediction_2: 34,
  goals_under: 45, goals_over: 55, correct_score: '1-1', correct_score_odds: 8.0,
}

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const fetchMatches = async () => {
    const { data } = await supabase.from('matches').select(`*, predictions(*)`).order('match_time')
    if (data) setMatches(data as Match[])
    setLoading(false)
  }

  useEffect(() => { fetchMatches() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      let matchId = editId
      if (editId) {
        await supabase.from('matches').update({
          home_team: form.home_team, away_team: form.away_team,
          match_time: form.match_time, match_date: form.match_date,
          league: form.league, status: form.status,
        }).eq('id', editId)
      } else {
        const { data } = await supabase.from('matches').insert({
          home_team: form.home_team, away_team: form.away_team,
          match_time: form.match_time, match_date: form.match_date,
          league: form.league, status: form.status,
        }).select().single()
        matchId = data?.id
      }
      if (matchId) {
        await supabase.from('predictions').upsert({
          match_id: matchId,
          prediction_1: form.prediction_1, prediction_x: form.prediction_x, prediction_2: form.prediction_2,
          goals_under: form.goals_under, goals_over: form.goals_over,
          correct_score: form.correct_score, correct_score_odds: form.correct_score_odds,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'match_id' })
      }
      setMessage(editId ? 'Match updated!' : 'Match added!')
      setShowForm(false)
      setEditId(null)
      setForm(emptyForm)
      fetchMatches()
    } catch (e) {
      setMessage('Error saving match.')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleEdit = (match: Match) => {
    const pred = match.predictions?.[0]
    setForm({
      home_team: match.home_team, away_team: match.away_team,
      match_time: match.match_time, match_date: match.match_date,
      league: match.league, status: match.status || 'scheduled',
      prediction_1: pred?.prediction_1 || 33, prediction_x: pred?.prediction_x || 33, prediction_2: pred?.prediction_2 || 34,
      goals_under: pred?.goals_under || 45, goals_over: pred?.goals_over || 55,
      correct_score: pred?.correct_score || '1-1', correct_score_odds: pred?.correct_score_odds || 8.0,
    })
    setEditId(match.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this match?')) return
    await deleteMatch(id)
    setMessage('Match deleted.')
    fetchMatches()
    setTimeout(() => setMessage(''), 3000)
  }

  const input = (label: string, key: string, type = 'text', opts?: string[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: '10px', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</label>
      {opts ? (
        <select value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #d3d1c7', fontSize: 13, background: '#fff', color: '#1a1a18', fontFamily: 'inherit' }}>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={(form as any)[key]}
          onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #d3d1c7', fontSize: 13, color: '#1a1a18', fontFamily: 'inherit' }} />
      )}
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'var(--font-display)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '0.5px solid #d3d1c7', paddingBottom: '1.25rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', color: '#1a1a18' }}>Admin Panel</h1>
          <p style={{ fontSize: '11px', color: '#888780', margin: 0 }}><a href="/" style={{ color: '#639922', textDecoration: 'none' }}>← Back to site</a></p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}
          style={{ background: '#1a1a18', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Add Match
        </button>
      </header>

      {message && (
        <div style={{ background: '#eaf3de', color: '#3b6d11', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          {message}
        </div>
      )}

      {showForm && (
        <div style={{ background: '#fff', border: '0.5px solid #d3d1c7', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 1.25rem', color: '#1a1a18' }}>{editId ? 'Edit Match' : 'New Match'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {input('Home Team', 'home_team')}
            {input('Away Team', 'away_team')}
            {input('League', 'league', 'text', LEAGUES)}
            {input('Match Time', 'match_time')}
            {input('Match Date', 'match_date')}
            {input('Status', 'status', 'text', ['scheduled', 'live', 'finished'])}
          </div>
          <div style={{ borderTop: '0.5px solid #d3d1c7', paddingTop: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, fontWeight: 600 }}>Predictions</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {input('1 Win %', 'prediction_1', 'number')}
              {input('Draw %', 'prediction_x', 'number')}
              {input('2 Win %', 'prediction_2', 'number')}
              {input('Goals Under %', 'goals_under', 'number')}
              {input('Goals Over %', 'goals_over', 'number')}
              {input('Correct Score', 'correct_score')}
              {input('Score Odds', 'correct_score_odds', 'number')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ background: '#1a1a18', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Saving...' : 'Save Match'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }}
              style={{ background: '#f4f3ef', color: '#1a1a18', border: '0.5px solid #d3d1c7', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888780' }}>Loading...</div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 80px 100px 100px', padding: '0 1rem 6px', gap: 8 }}>
            {['Match', 'League', 'Time', 'Status', 'Score', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 10, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{h}</div>
            ))}
          </div>
          {matches.map(match => {
            const pred = match.predictions?.[0]
            return (
              <div key={match.id} style={{ background: '#fff', border: '0.5px solid #d3d1c7', borderRadius: 10, marginBottom: 8, padding: '0.875rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 120px 80px 100px 100px', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18' }}>{match.home_team}</div>
                  <div style={{ fontSize: 12, color: '#888780' }}>{match.away_team}</div>
                </div>
                <div style={{ fontSize: 12, color: '#5f5e5a' }}>{match.league}</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#1a1a18' }}>{match.match_time}</div>
                <div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: match.status === 'live' ? '#eaf3de' : match.status === 'finished' ? '#f4f3ef' : '#fff3cd',
                    color: match.status === 'live' ? '#3b6d11' : match.status === 'finished' ? '#888780' : '#856404',
                  }}>{match.status || 'scheduled'}</span>
                </div>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#085041', fontWeight: 600 }}>{pred?.correct_score || '—'}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleEdit(match)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '0.5px solid #d3d1c7', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', color: '#1a1a18' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(match.id)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '0.5px solid #ffd0d0', background: '#fff5f5', cursor: 'pointer', fontFamily: 'inherit', color: '#c0392b' }}>
                    Del
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
