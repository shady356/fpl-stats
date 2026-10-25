import type { Team, TeamMatches } from '@/types/team.ts'
import { aggregateMatches, type MatchWindow } from '@/utils/aggregateMatches.ts'
import { computeForm } from '@/utils/form.ts'
import { computePlayStyles } from '@/utils/playStyles.ts'
import { computeRatings } from '@/utils/ratings.ts'
import { teamShortName } from '@/utils/teamShortNames'

/**
 * Build full Team objects from per-match stats: totals, ratings, play style, form and short name.
 * @param teamMatches - Teams with their matches; not modified.
 * @param window - Rate teams on only their last n matches, or 'all' for the whole season.
 * @returns New team objects, ordered by league position.
 */
export function computeTeamData(teamMatches: TeamMatches[], window: MatchWindow = 'all'): Team[] {
  const teams = aggregateMatches(teamMatches, window)
  const ratings = computeRatings(teams)
  const playStyles = computePlayStyles(teams)
  // Form is always the last 5 matches of the season, regardless of `window`.
  const forms = computeForm(teamMatches)
  const formById = new Map(teamMatches.map((team, index) => [team.team_id, forms[index]]))

  return teams.map((team, index) => ({
    ...team,
    ...ratings[index],
    ...playStyles[index],
    form: formById.get(team.team_id) ?? [],
    team_name_short: teamShortName(team.team_name),
  }))
}
