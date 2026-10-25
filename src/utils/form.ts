import type { FormMatch, TeamMatches } from '@/types/team.ts'

/**
 * How many of each team's most recent matches make up its form.
 */
export const FORM_LENGTH = 5

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
        result: match.points === 3 ? 'W' : match.points === 1 ? 'D' : 'L',
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
