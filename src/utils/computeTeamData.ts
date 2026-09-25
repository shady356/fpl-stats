import type { Team, TeamStats } from '@/types/team.ts'
import { computePlayStyles } from '@/utils/playStyles.ts'
import { computeRatings } from '@/utils/ratings.ts'
import { teamBadgeUrl } from '@/utils/teamBadges.ts'

/**
 * Build full Team objects from raw stats: ratings, play style and badge URL.
 * @param teams - Team stat objects; not modified.
 * @returns New team objects, in the same order as `teams`.
 */
export function computeTeamData(teams: TeamStats[]): Team[] {
  const ratings = computeRatings(teams)
  const playStyles = computePlayStyles(teams)

  return teams.map((team, index) => ({
    ...team,
    ...ratings[index],
    ...playStyles[index],
    badge_url: teamBadgeUrl(team.team_name),
  }))
}
