import type { PlayerMatch } from '@/types/player.ts'

/**
 * A player's result for one gameweek, combining both matches of a double gameweek.
 */
export type PlayerGameweek = {
  gameweek: number
  points: number
  minutes: number
  /** The gameweek's matches, in kickoff order. */
  matches: PlayerMatch[]
  /** Price after the gameweek's last match, in tenths of a million. */
  price: number
}

/**
 * Group a player's matches by gameweek.
 * @param history - The player's matches; not modified.
 * @returns One entry per gameweek the player had a match in, oldest first.
 */
export function playerGameweeks(history: PlayerMatch[]): PlayerGameweek[] {
  const byGameweek = new Map<number, PlayerMatch[]>()
  for (const match of history.toSorted((a, b) => a.kickoff_time.localeCompare(b.kickoff_time))) {
    byGameweek.set(match.round, [...(byGameweek.get(match.round) ?? []), match])
  }

  return [...byGameweek]
    .toSorted(([a], [b]) => a - b)
    .map(([gameweek, matches]) => ({
      gameweek,
      points: matches.reduce((total, match) => total + match.total_points, 0),
      minutes: matches.reduce((total, match) => total + match.minutes, 0),
      matches,
      price: matches[matches.length - 1].value,
    }))
}

/**
 * The match score from the player's side, e.g. W 2-1.
 * @param match - The match.
 * @returns The result, or undefined if the match hasn't finished.
 */
export function matchResult(match: PlayerMatch): string | undefined {
  if (match.team_h_score === null || match.team_a_score === null) return undefined

  const [scored, conceded] = match.was_home
    ? [match.team_h_score, match.team_a_score]
    : [match.team_a_score, match.team_h_score]
  const outcome = scored > conceded ? 'W' : scored < conceded ? 'L' : 'D'

  return `${outcome} ${scored}-${conceded}`
}
