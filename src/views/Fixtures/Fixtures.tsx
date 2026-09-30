import { Suspense, use } from 'react'

import { fetchFixtures } from '@/services/FplAPI'
import type { Fixture, TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Team } from '@/types/team.ts'

import './Fixtures.css'

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
    <div className="table-fixtures-wrapper">
      <table className="table-fixtures">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>
              <button className="sort-button" disabled>
                Teams
              </button>
            </th>
            {gameweeks.map((_, i) => (
              <th key={i}>
                <button className="sort-button" disabled>
                  {`GW ${i + 6}`}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teamWithFixtures.map((team) => (
            <tr key={team.team_id}>
              <td>
                <div className="team-name">
                  {team.badge_url && <img className="team-badge" src={team.badge_url} alt="" />}
                  {team.team_name}
                </div>
              </td>
              {team.fixtures.map((fixture) => (
                <td key={fixture.fixture_id}>
                  <div
                    className="table-fixture-opponent"
                    style={{ background: fixture.opponent.rating_total_color }}
                  >
                    {fixture.opponent.team_name_short}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      team_name_short: opponent.team_name_short,
      rating_total_color: opponent.rating_total_color,
      rating_attack_color: opponent.rating_attack_color,
      rating_defense_color: opponent.rating_defense_color,
    },
  }
}

export default Fixtures
