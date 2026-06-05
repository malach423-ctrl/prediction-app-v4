// Run: npx ts-node scripts/seed.ts
// Or paste the SQL directly into your Supabase SQL editor:
/*
INSERT INTO matches (home_team, away_team, match_time, match_date, league) VALUES
  ('Manchester United', 'Liverpool', '20:00', 'Today', 'Premier League'),
  ('Real Madrid', 'Barcelona', '15:30', 'Today', 'La Liga'),
  ('Bayern Munich', 'Borussia Dortmund', '18:00', 'Today', 'Bundesliga');

INSERT INTO predictions (match_id, prediction_1, prediction_x, prediction_2, goals_under, goals_over, correct_score, correct_score_odds)
SELECT m.id, p.p1, p.px, p.p2, p.under, p.over, p.score, p.odds
FROM matches m
JOIN (VALUES
  ('Manchester United', 45, 28, 27, 42, 58, '1-1', 8.50),
  ('Real Madrid', 38, 32, 30, 35, 65, '2-1', 7.20),
  ('Bayern Munich', 52, 26, 22, 38, 62, '2-0', 9.10)
) AS p(team, p1, px, p2, under, over, score, odds)
ON m.home_team = p.team;
*/

export {}
