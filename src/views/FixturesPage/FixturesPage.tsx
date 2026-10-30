import { Suspense, use, useState } from 'react'

import BaseSegmentedButton from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButton.tsx'
import BaseSegmentedButtons from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButtons.tsx'
import Table from '@/components/ui/Table/Table.tsx'
import TableHeaderCell from '@/components/ui/Table/TableHeaderCell.tsx'
import TeamName from '@/components/ui/TeamName/TeamName.tsx'
import { fetchFixtures } from '@/services/FplAPI'
import type { Team } from '@/types/team.ts'
import { fixtureDifficulty, getTeamFixtureList } from '@/utils/teamFixtures.ts'

import './FixturesPage.css'

const fixturesPromise = fetchFixtures()

/**
 * How many upcoming gameweeks to sort by; 'none' keeps the default team order.
 */
type FixtureRun = 'none' | 3 | 5

const FIXTURE_RUN_OPTIONS: { value: FixtureRun; label: string }[] = [
  { value: 'none', label: 'Default' },
  { value: 3, label: 'Next 3' },
  { value: 5, label: 'Next 5' },
]

type FixturesPageProps = {
  teams: Team[]
}

function FixturesPage({ teams }: FixturesPageProps) {
  const [fixtureRun, setFixtureRun] = useState<FixtureRun>('none')

  return (
    <div className="fixtures-page">
      <div className="fixtures-filters">
        <h1>Fixtures</h1>
        <span id="fixture-run-label">Easiest run</span>
        <BaseSegmentedButtons aria-labelledby="fixture-run-label">
          {FIXTURE_RUN_OPTIONS.map(({ value, label }) => (
            <BaseSegmentedButton
              key={value}
              selected={fixtureRun === value}
              onClick={() => setFixtureRun(value)}
            >
              {label}
            </BaseSegmentedButton>
          ))}
        </BaseSegmentedButtons>
      </div>
      <Suspense fallback={<p>Loading fixtures…</p>}>
        <FixtureList teams={teams} fixtureRun={fixtureRun} />
      </Suspense>
    </div>
  )
}

type FixtureListProps = FixturesPageProps & {
  fixtureRun: FixtureRun
}

function FixtureList({ teams, fixtureRun }: FixtureListProps) {
  const fixtures = use(fixturesPromise)
  const teamWithFixtures = getTeamFixtureList(teams, fixtures)
  const MAX_GAMEWEEKS = 38
  if (fixtures.length === 0) {
    return <p>Could not load fixtures.</p>
  }

  // Future fixtures exclude played games, so the earliest one is the next gameweek
  const nextGameweek = Math.min(...fixtures.map((fixture) => fixture.event))
  const remainingGames = MAX_GAMEWEEKS - nextGameweek + 1
  const gameweeks = new Array(remainingGames).fill(0)

  const rows = teamWithFixtures.map((team) => ({
    team,
    difficulty:
      fixtureRun === 'none'
        ? undefined
        : fixtureDifficulty(team.fixtures, nextGameweek, fixtureRun),
  }))
  if (fixtureRun !== 'none') {
    // Easiest first; teams without fixtures in the run go last
    rows.sort((a, b) => (a.difficulty ?? Infinity) - (b.difficulty ?? Infinity))
  }

  return (
    <Table scrollable>
      <thead>
        <tr>
          <TableHeaderCell align="left">Teams</TableHeaderCell>
          {fixtureRun !== 'none' && <TableHeaderCell>Difficulty</TableHeaderCell>}
          {gameweeks.map((_, i) => (
            <TableHeaderCell key={i}>{`GW ${nextGameweek + i}`}</TableHeaderCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(({ team, difficulty }) => (
          <tr key={team.team_id}>
            <td>
              <TeamName team={team} />
            </td>
            {fixtureRun !== 'none' && <td>{difficulty?.toFixed(0) ?? '–'}</td>}
            {gameweeks.map((_, i) => (
              <td key={i}>
                {team.fixtures
                  .filter((fixture) => fixture.event === nextGameweek + i)
                  .map((fixture) => (
                    <div
                      key={fixture.fixture_id}
                      className={[
                        'table-fixture-opponent',
                        fixtureRun !== 'none' && i < fixtureRun && 'table-fixture-opponent-in-run',
                      ]
                        .filter(Boolean)
                        .join(' ')}
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
