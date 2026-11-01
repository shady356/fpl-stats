import { Suspense, use, useState } from 'react'

import BaseSegmentedButton from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButton.tsx'
import BaseSegmentedButtons from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButtons.tsx'
import Table from '@/components/ui/Table/Table.tsx'
import TableHeaderCell from '@/components/ui/Table/TableHeaderCell.tsx'
import TeamName from '@/components/ui/TeamName/TeamName.tsx'
import { fetchFixtures } from '@/services/FplAPI'
import type { Team } from '@/types/team.ts'
import { RATING_COLORS, reviseTotalRating } from '@/utils/ratings.ts'
import {
  fixtureDifficulty,
  getTeamFixtureList,
  opponentRatingColor,
  teamRating,
  type FixtureMode,
} from '@/utils/teamFixtures.ts'

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

/**
 * Labelled from the point of view of the team's own players, e.g. 'Attackers' asks
 * how easy the fixtures are for this team's attackers, judged by the opponent's defense.
 */
const FIXTURE_MODE_OPTIONS: {
  value: FixtureMode
  label: string
  hint: string
  /** Short name of the team's own rating shown next to its name. */
  teamRatingLabel: string
}[] = [
  {
    value: 'all',
    label: 'Overall',
    hint: "Rated by the opponent's overall strength",
    teamRatingLabel: 'Rating',
  },
  {
    value: 'attack',
    label: 'Attackers',
    hint: "Rated by the opponent's defense",
    teamRatingLabel: 'ATT',
  },
  {
    value: 'defense',
    label: 'Defenders',
    hint: "Rated by the opponent's attack",
    teamRatingLabel: 'DEF',
  },
]

type FixturesPageProps = {
  teams: Team[]
}

function FixturesPage({ teams }: FixturesPageProps) {
  const [fixtureRun, setFixtureRun] = useState<FixtureRun>('none')
  const [fixtureMode, setFixtureMode] = useState<FixtureMode>('all')

  return (
    <div className="fixtures-page">
      <div className="fixtures-filters">
        <h1>Fixtures</h1>
        <span id="fixture-mode-label">Fixtures for</span>
        <BaseSegmentedButtons aria-labelledby="fixture-mode-label">
          {FIXTURE_MODE_OPTIONS.map(({ value, label, hint }) => (
            <BaseSegmentedButton
              key={value}
              title={hint}
              selected={fixtureMode === value}
              onClick={() => setFixtureMode(value)}
            >
              {label}
            </BaseSegmentedButton>
          ))}
        </BaseSegmentedButtons>
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
        <FixtureList teams={teams} fixtureRun={fixtureRun} fixtureMode={fixtureMode} />
      </Suspense>
    </div>
  )
}

type FixtureListProps = FixturesPageProps & {
  fixtureRun: FixtureRun
  fixtureMode: FixtureMode
}

function FixtureList({ teams, fixtureRun, fixtureMode }: FixtureListProps) {
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
  const { teamRatingLabel } = FIXTURE_MODE_OPTIONS.find(({ value }) => value === fixtureMode)!

  const rows = teamWithFixtures.map((team) => ({
    team,
    difficulty:
      fixtureRun === 'none'
        ? undefined
        : fixtureDifficulty(team.fixtures, nextGameweek, fixtureRun, fixtureMode),
  }))
  if (fixtureRun !== 'none') {
    // Easiest first; teams without fixtures in the run go last
    rows.sort((a, b) => (a.difficulty ?? Infinity) - (b.difficulty ?? Infinity))
  }

  return (
    <Table
      scrollable
      className={fixtureRun !== 'none' ? `fixtures-table-run-${fixtureRun}` : undefined}
    >
      <thead>
        <tr>
          <TableHeaderCell align="left" title="The team's own rating (0-100) for the selected mode">
            <span className="fixtures-team">
              Teams
              <span className="fixtures-team-rating">{teamRatingLabel}</span>
            </span>
          </TableHeaderCell>
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
              <div className="fixtures-team">
                <TeamName team={team} />
                <span className="fixtures-team-rating">
                  {Math.round(teamRating(team, fixtureMode))}
                </span>
              </div>
            </td>
            {fixtureRun !== 'none' && (
              <td>
                {difficulty === undefined ? (
                  '–'
                ) : (
                  <span
                    className="fixtures-difficulty"
                    style={{ background: RATING_COLORS[reviseTotalRating(difficulty)] }}
                  >
                    {difficulty.toFixed(0)}
                  </span>
                )}
              </td>
            )}
            {gameweeks.map((_, i) => (
              <td key={i}>
                {team.fixtures
                  .filter((fixture) => fixture.event === nextGameweek + i)
                  .map((fixture) => (
                    <div
                      key={fixture.fixture_id}
                      className="table-fixture-opponent"
                      style={{ background: opponentRatingColor(fixture, fixtureMode) }}
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
