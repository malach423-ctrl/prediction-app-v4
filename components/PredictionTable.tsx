'use client'

import { Match } from '@/lib/supabase'

export default function PredictionTable({ matches }: { matches: Match[] }) {
  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 210px 150px 120px',
        padding: '0 0 6px',
        marginBottom: '4px',
      }}>
        {['Time', 'Match', '1 · X · 2', 'Goals O/U', 'Score'].map((h, i) => (
          <div key={h} style={{
            fontSize: '10px', color: '#888780', textTransform: 'uppercase',
            letterSpacing: '0.5px', fontWeight: 500,
            textAlign: i >= 2 ? 'center' : 'left',
            paddingLeft: i === 0 ? '1rem' : i === 1 ? '1.25rem' : 0,
          }}>{h}</div>
        ))}
      </div>

      {matches.map((match) => {
        const pred = match.predictions?.[0]
        if (!pred) return null
        const max = Math.max(pred.prediction_1, pred.prediction_x, pred.prediction_2)

        return (
          <div key={match.id} style={{
            background: '#fff',
            border: '0.5px solid #d3d1c7',
            borderRadius: '12px',
            marginBottom: '10px',
            overflow: 'hidden',
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#b4b2a9')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#d3d1c7')}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 210px 150px 120px', alignItems: 'center' }}>

              {/* Time */}
              <div style={{ padding: '1rem', borderRight: '0.5px solid #d3d1c7', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#1a1a18' }}>{match.match_time}</div>
                <div style={{ fontSize: '10px', color: '#b4b2a9', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{match.match_date}</div>
              </div>

              {/* Teams */}
              <div style={{ padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '12px', color: '#888780', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{match.league}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a18' }}>{match.home_team}</div>
                <div style={{ fontSize: '10px', color: '#b4b2a9', margin: '2px 0' }}>vs</div>
                <div style={{ fontSize: '13px', color: '#5f5e5a' }}>{match.away_team}</div>
              </div>

              {/* 1X2 */}
              <div style={{ padding: '0.75rem 1rem', borderLeft: '0.5px solid #d3d1c7', display: 'flex', gap: 6, justifyContent: 'center' }}>
                {[
                  { label: '1', value: pred.prediction_1 },
                  { label: 'X', value: pred.prediction_x },
                  { label: '2', value: pred.prediction_2 },
                ].map(({ label, value }) => {
                  const hot = value === max
                  return (
                    <div key={label} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      padding: '6px 10px', borderRadius: '8px', minWidth: 48,
                      background: hot ? '#eaf3de' : '#f4f3ef',
                    }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', color: hot ? '#3b6d11' : '#888780' }}>{label}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: hot ? '#173404' : '#1a1a18' }}>{value}%</span>
                    </div>
                  )
                })}
              </div>

              {/* Goals */}
              <div style={{ padding: '0.75rem 1rem', borderLeft: '0.5px solid #d3d1c7', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Over', value: pred.goals_over, color: '#639922' },
                  { label: 'Under', value: pred.goals_under, color: '#b4b2a9' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '10px', color: '#b4b2a9', fontFamily: 'var(--font-mono)', minWidth: 36, textTransform: 'uppercase' }}>{label}</span>
                    <div style={{ flex: 1, height: 4, background: '#f4f3ef', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#5f5e5a', minWidth: 30, textAlign: 'right' }}>{value}%</span>
                  </div>
                ))}
              </div>

              {/* Score */}
              <div style={{ padding: '0.75rem 1rem', borderLeft: '0.5px solid #d3d1c7', textAlign: 'center' }}>
                <div style={{
                  display: 'inline-block', background: '#e1f5ee', color: '#085041',
                  fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 500,
                  padding: '6px 14px', borderRadius: '8px', letterSpacing: '1px',
                }}>
                  {pred.correct_score}
                </div>
                <div style={{ fontSize: '11px', color: '#b4b2a9', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                  {Number(pred.correct_score_odds).toFixed(2)}
                </div>
              </div>

            </div>
          </div>
        )
      })}
    </div>
  )
}
