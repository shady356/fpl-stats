import { Suspense, use } from 'react'

import { fetchFixtures } from '@/services/FplAPI'
import type { Fixture, TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Team } from '@/types/team.ts'

const fixturesPromise = fetchFixtures()

type FixtureProps = {
  teams: Team[]
}

function Fixtures({ teams }: FixtureProps) {
  return (
    <Suspense fallback={<p>Loading fixtures…</p>}>
      <FixtureList teams={teams} />
    </Suspense>
  )
}

function FixtureList({ teams }: FixtureProps) {
  const fixtures = use(fixturesPromise)
  const teamWithFixtures = getTeamFixtureList(teams, fixtures)

  const gameweeks = new Array(33).fill(0)

  return (
    <table>
      <thead>
        <tr>
          <th>Teams</th>
          {gameweeks.map((_, i) => (
            <th key={i}>{`GW ${i + 6}`}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {teamWithFixtures.map((team) => (
          <tr key={team.team_id}>
            <td>{team.team_name}</td>
            {team.fixtures.map((fixture) => (
              <td
                key={fixture.fixture_id}
                style={{ background: fixture.opponent.rating_total_color }}
              >
                {fixture.opponent.team_name}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function getTeamFixtureList(teams: Team[], fixtures: Fixture[]): TeamWithFixtures[] {
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
      short_name: opponent.team_name, // Team has no short_name yet
      rating_total_color: opponent.rating_total_color,
      rating_attack_color: opponent.rating_attack_color,
      rating_defense_color: opponent.rating_defense_color,
    },
  }
}

export default Fixtures
