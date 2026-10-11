import type { MatchStats, TeamMatches, TeamStats } from '@/types/team.ts'

import { round } from './round.ts'

/**
 * How many of each team's most recent matches to include; 'all' for the whole season.
 */
export type MatchWindow = 3 | 5 | 10 | 'all'

function sum(matches: MatchStats[], getValue: (m: MatchStats) => number | null): number {
  return matches.reduce((total, m) => total + (getValue(m) ?? 0), 0)
}

/**
 * Sum one team's matches into TeamStats. `position` is left at 0 for the caller to fill in.
 * @param team - The team and the matches to include.
 * @returns Totals, plus per-game averages for deep completions and PPDA.
 *   Decimal stats are rounded to 2 places, matching the precision of the old season totals file.
 */
function aggregateTeam({ team_id, team_name, matches }: TeamMatches): TeamStats {
  const games = matches.length
  const perGame = (total: number) => (games ? round(total / games) : 0)

  return {
    team_id,
    team_name,
    position: 0,
    games_played: games,
    points: sum(matches, (m) => m.points),
    expected_points: round(sum(matches, (m) => m.expected_points)),
    goals: sum(matches, (m) => m.goals),
    xg: round(sum(matches, (m) => m.xg)),
    npxg: round(sum(matches, (m) => m.npxg)),
    ga: sum(matches, (m) => m.ga),
    xga: round(sum(matches, (m) => m.xga)),
    npxga: round(sum(matches, (m) => m.npxga)),
    shots: sum(matches, (m) => m.shots),
    shots_on_target: sum(matches, (m) => m.shots_on_target),
    shots_against: sum(matches, (m) => m.shots_against),
    shots_on_target_against: sum(matches, (m) => m.shots_on_target_against),
    deep_per_game: perGame(sum(matches, (m) => m.deep)),
    deep_allowed_per_game: perGame(sum(matches, (m) => m.deep_allowed)),
    // Matches without a PPDA count as 0, as fetch_stats.py always did.
    ppda_per_game: perGame(sum(matches, (m) => m.ppda)),
    o_ppda_per_game: perGame(sum(matches, (m) => m.o_ppda)),
  }
}

/**
 * League position of every team: points, then goal difference, then goals.
 * @param teams - Aggregated stats per team.
 * @returns The same teams with `position` filled in (1 = top), in that order.
 */
function rankTeams(teams: TeamStats[]): TeamStats[] {
  return [...teams]
    .sort((a, b) => b.points - a.points || b.goals - b.ga - (a.goals - a.ga) || b.goals - a.goals)
    .map((team, index) => ({ ...team, position: index + 1 }))
}

/**
 * Build TeamStats for each team from its last `window` matches.
 * `position` is the league position over that same window, so it reflects the current form table.
 * @param teams - Teams with their matches, oldest first; not modified.
 * @param window - Number of most recent matches per team, or 'all'.
 * @returns One TeamStats per team, ordered by position.
 */
export function aggregateMatches(teams: TeamMatches[], window: MatchWindow = 'all'): TeamStats[] {
  return rankTeams(
    teams.map((team) => {
      const matches = window === 'all' ? team.matches : team.matches.slice(-window)
      return aggregateTeam({ ...team, matches })
    }),
  )
}
