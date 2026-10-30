import type { Fixture, TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Team } from '@/types/team.ts'

/**
 * Attach each team's fixtures (home and away) to the team object.
 * @param teams - Team objects; not modified.
 * @param fixtures - All fixtures; ones involving unknown teams are skipped.
 * @returns New team objects with `fixtures`, in the same order as `teams`.
 */
export function getTeamFixtureList(teams: Team[], fixtures: Fixture[]): TeamWithFixtures[] {
  // Map: [team_id, {Team & Fixtures}]
  const teamsById = new Map<number, TeamWithFixtures>(
    teams.map((team) => [team.team_id, { ...team, fixtures: [] }]),
  )

  for (const fixture of fixtures) {
    const home = teamsById.get(fixture.team_h)
    const away = teamsById.get(fixture.team_a)

    if (home && away) {
      home.fixtures.push(toTeamFixture(fixture, away, true))
      away.fixtures.push(toTeamFixture(fixture, home, false))
    }
  }

  return [...teamsById.values()]
}

function toTeamFixture(fixture: Fixture, opponent: Team, isHome: boolean): TeamFixture {
  return {
    fixture_id: fixture.id,
    event: fixture.event,
    is_home: isHome,
    opponent: {
      team_name: opponent.team_name,
      team_name_short: opponent.team_name_short,
      rating_total: opponent.rating_total,
      rating_total_color: opponent.rating_total_color,
      rating_attack_color: opponent.rating_attack_color,
      rating_defense_color: opponent.rating_defense_color,
    },
  }
}

/**
 * Average total rating of a team's opponents over a run of gameweeks; lower is easier.
 * @param fixtures - The team's fixtures.
 * @param firstGameweek - First gameweek of the run.
 * @param gameweeks - Number of gameweeks in the run.
 * @returns Average opponent rating (0-100), or undefined if the team has no fixtures in the run.
 */
export function fixtureDifficulty(
  fixtures: TeamFixture[],
  firstGameweek: number,
  gameweeks: number,
): number | undefined {
  const inRun = fixtures.filter(
    (fixture) => fixture.event >= firstGameweek && fixture.event < firstGameweek + gameweeks,
  )
  if (inRun.length === 0) return undefined

  return inRun.reduce((total, fixture) => total + fixture.opponent.rating_total, 0) / inRun.length
}
