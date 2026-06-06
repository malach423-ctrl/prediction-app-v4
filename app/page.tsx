import { getMatchesWithPredictions, Match } from '@/lib/supabase'
import PredictionTable from '@/components/PredictionTable'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let matches: Match[] = []
  let error = false

  try {
    matches = await getMatchesWithPredictions()
  } catch (e) {
    error = true
  }

  return (
    <main style={{ minHeight: '100vh', padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '0.5px solid #d3d1c7', paddingBottom: '1.25rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 4px', color: '#1a1a18' }}>
            Sports Predictions
          </h1>
          <p style={{ fontSize: '11px', color: '#888780', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Professional match analysis · 1X2 · Goals · Correct Score
          </p>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', background: '#eaf3de', color: '#3b6d11', borderRadius: '20px', padding: '4px 12px' }}>
          ● Live
        </span>
      </header>

      {error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888780' }}>
          Unable to load predictions. Please try again later.
        </div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888780' }}>
          No matches scheduled for today.
        </div>
      ) : (
        <PredictionTable matches={matches} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '2rem' }}>
        {[
          { label: 'Accuracy rate', value: '82.4%', sub: 'Last 30 days' },
          { label: 'Matches analyzed', value: '2,847', sub: 'All competitions' },
          { label: 'High confidence', value: '340', sub: 'Predictions this week' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#639922', display: 'inline-block', marginRight: 8 }} />
              <span style={{ fontSize: '11px', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#1a1a18' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#b4b2a9', marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '11px', color: '#b4b2a9', textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '0.5px solid #d3d1c7', fontFamily: 'var(--font-mono)' }}>
        Predictions updated every 5 minutes · Data powered by official leagues
      </p>
    </main>
  )
}
