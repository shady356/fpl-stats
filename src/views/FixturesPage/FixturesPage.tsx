import { Suspense, use } from 'react'
import { NavLink } from 'react-router'

import Table from '@/components/ui/Table/Table.tsx'
import TableHeaderCell from '@/components/ui/Table/TableHeaderCell.tsx'
import TeamName from '@/components/ui/TeamName/TeamName.tsx'
import { fetchFixtures } from '@/services/FplAPI'
import type { Team } from '@/types/team.ts'
import { getTeamFixtureList } from '@/utils/teamFixtures.ts'

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
              <NavLink to={`/team/${team.team_id}`}>
                <TeamName team={team} />
              </NavLink>
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

export default FixturesPage
