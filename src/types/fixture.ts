/**
 * One league match, as written to `epl-stats/data` by `fetch_stats.py`.
 * Goals and xG are null until the match has been played.
 */
export type Fixture = {
  fixture_id: number
  /** ISO 8601 UTC kickoff time, e.g. "2026-10-10T11:30:00Z". */
  kickoff: string
  home_team_id: number
  away_team_id: number
  home_goals: number | null
  away_goals: number | null
  home_xg: number | null
  away_xg: number | null
}
