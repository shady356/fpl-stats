import { Suspense, use } from 'react'

import Table from '@/components/ui/Table/Table.tsx'
import TableHeaderCell from '@/components/ui/Table/TableHeaderCell.tsx'
import TeamName from '@/components/ui/TeamName/TeamName.tsx'
import { fetchCurrentGameweek, fetchFixtures } from '@/services/FplAPI'
import type { Team } from '@/types/team.ts'
import { getTeamFixtureList } from '@/utils/teamFixtures.ts'

import './FixturesPage.css'

const fixturesPromise = fetchFixtures()
const currentGameweekPromise = fetchCurrentGameweek()

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
  const currentGameweek = use(currentGameweekPromise)
  const teamWithFixtures = getTeamFixtureList(teams, fixtures)
  const MAX_GAMEWEEKS = 38
  if (currentGameweek === undefined) {
    return <p>Could not load the current gameweek.</p>
  }

  const remainingGames = MAX_GAMEWEEKS - currentGameweek
  const gameweeks = new Array(remainingGames).fill(0)

  return (
    <Table scrollable>
      <thead>
        <tr>
          <TableHeaderCell align="left">Teams</TableHeaderCell>
          {gameweeks.map((_, i) => (
            <TableHeaderCell key={i}>{`GW ${currentGameweek + i + 1}`}</TableHeaderCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {teamWithFixtures.map((team) => (
          <tr key={team.team_id}>
            <td>
              <TeamName team={team} />
            </td>
            {gameweeks.map((_, i) => (
              <td key={i}>
                {team.fixtures
                  .filter((fixture) => fixture.event === currentGameweek + i + 1)
                  .map((fixture) => (
                    <div
                      key={fixture.fixture_id}
                      className="table-fixture-opponent"
                      style={{ background: fixture.opponent.rating_total_color }}
                    >
                      {fixture.opponent.team_name_short}
                    </div>
                  ))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default FixturesPage
