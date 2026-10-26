import type { FormMatch, TeamMatches } from '@/types/team.ts'
import { RATING_COLORS } from '@/utils/ratings.ts'

/**
 * How many of each team's most recent matches make up its form.
 */
export const FORM_LENGTH = 5

/**
 * Win, draw and loss colors, matching rating levels 2-4.
 */
export const FORM_COLORS: Record<FormMatch['result'], string> = {
  W: RATING_COLORS[2],
  D: RATING_COLORS[3],
  L: RATING_COLORS[4],
}

/**
 * Each team's last FORM_LENGTH results, oldest first.
 * @param teams - Teams with their matches, oldest first; not modified.
 * @returns Form per team, in the same order as `teams`.
 */
export function computeForm(teams: TeamMatches[]): FormMatch[][] {
  const namesById = new Map(teams.map((team) => [team.team_id, team.team_name]))

  return teams.map((team) =>
    team.matches.slice(-FORM_LENGTH).map((match) => {
      const opponentName = namesById.get(match.opponent_id) ?? 'Unknown'
      return {
        match_id: match.match_id,
        date: match.date,
        result: match.points === 3 ? 'W' : match.points === 1 ? 'D' : 'L',
        home_team_id: match.home ? team.team_id : match.opponent_id,
        away_team_id: match.home ? match.opponent_id : team.team_id,
        home_team: match.home ? team.team_name : opponentName,
        away_team: match.home ? opponentName : team.team_name,
        home_goals: match.home ? match.goals : match.ga,
        away_goals: match.home ? match.ga : match.goals,
      }
    }),
  )
}

/**
 * Points earned over a form run, for sorting.
 * @param form - Form results.
 * @returns 3 per win, 1 per draw.
 */
export function formPoints(form: FormMatch[]): number {
  return form.reduce((total, m) => total + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0)
}
