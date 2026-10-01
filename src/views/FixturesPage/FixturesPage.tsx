import { Suspense, use } from 'react'

import Table from '@/components/ui/Table/Table.tsx'
import TableHeaderCell from '@/components/ui/Table/TableHeaderCell.tsx'
import { fetchFixtures } from '@/services/FplAPI'
import type { Fixture, TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Team } from '@/types/team.ts'

import './FixturesPage.css'

const fixturesPromise = fetchFixtures()

type FixturesPageProps = {
  teams: Team[]
}

function FixturesPage({ teams }: FixturesPageProps) {
  return (
    <div className="fixtures-page">
      <Suspense fallback={<p>Loading fixtures…</p>}>
        <FixtureList teams={teams} />
      </Suspense>
    </div>
  )
}

function FixtureList({ teams }: FixturesPageProps) {
  const fixtures = use(fixturesPromise)
  const teamWithFixtures = getTeamFixtureList(teams, fixtures)

  const gameweeks = new Array(33).fill(0)

  return (
    <Table scrollable>
      <thead>
        <tr>
          <TableHeaderCell align="left">Teams</TableHeaderCell>
          {gameweeks.map((_, i) => (
            <TableHeaderCell key={i}>{`GW ${i + 6}`}</TableHeaderCell>
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
    </Table>
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

export default FixturesPage
