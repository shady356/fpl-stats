import { Suspense, use, useState } from 'react'

import BaseSegmentedButton from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButton.tsx'
import BaseSegmentedButtons from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButtons.tsx'
import { usePlayers } from '@/hooks/usePlayers'
import { fetchFixtures } from '@/services/FplAPI'
import type { TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Player, PlayerPosition } from '@/types/player'
import type { Team } from '@/types/team.ts'
import {
  DIFFERENTIAL_MAX_SELECTED,
  isDifferential,
  mostTransferred,
  rankPicks,
} from '@/utils/playerPicks.ts'
import { POSITION_SHORT_LABELS } from '@/utils/positions'
import { getTeamFixtureList } from '@/utils/teamFixtures.ts'

import './OverviewPage.css'

import PlayerListCard from './components/PlayerListCard.tsx'

const fixturesPromise = fetchFixtures()

/** Gameweeks the recommendations look ahead. */
const RUN_LENGTH = 3

/** Players shown in each card. */
const CARD_COUNT = 6

const transferFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

type PositionFilter = 'all' | PlayerPosition

const POSITION_FILTER_OPTIONS: { value: PositionFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...([1, 2, 3, 4] as const).map((position) => ({
    value: position,
    label: POSITION_SHORT_LABELS[position],
  })),
]

type OverviewPageProps = {
  teams: Team[]
}

function OverviewPage({ teams }: OverviewPageProps) {
  return (
    <div className="overview-page">
      <Suspense fallback={<p>Loading overview…</p>}>
        <Dashboard teams={teams} />
      </Suspense>
    </div>
  )
}

function Dashboard({ teams }: OverviewPageProps) {
  const players = usePlayers()
  const fixtures = use(fixturesPromise)

  if (players.length === 0 || fixtures.length === 0) {
    return <p>Could not load overview.</p>
  }

  const teamsWithFixtures = getTeamFixtureList(teams, fixtures)
  const teamShortNames = new Map(teams.map((team) => [team.team_id, team.team_name_short]))
  // Future fixtures exclude played games, so the earliest one is the next gameweek
  const nextGameweek = Math.min(...fixtures.map((fixture) => fixture.event))
  const lastGameweek = nextGameweek + RUN_LENGTH - 1

  return (
    <>
      <div className="overview-header">
        <h1>Overview</h1>
        <span>
          Looking ahead to GW {nextGameweek}–{lastGameweek}
        </span>
      </div>

      <div className="overview-grid">
        <PlayerListCard
          title="Most transferred in"
          description="Managers buying this gameweek"
          tone="positive"
          teamShortNames={teamShortNames}
          rows={mostTransferred(players, 'in', CARD_COUNT).map((player) => ({
            player,
            value: `+${transferFormat.format(player.transfers_in_event)}`,
          }))}
        />
        <PlayerListCard
          title="Most transferred out"
          description="Managers selling this gameweek"
          tone="negative"
          teamShortNames={teamShortNames}
          rows={mostTransferred(players, 'out', CARD_COUNT).map((player) => ({
            player,
            value: `-${transferFormat.format(player.transfers_out_event)}`,
          }))}
        />
        <PicksCard
          title={`Players to consider · GW ${nextGameweek}–${lastGameweek}`}
          description="Form and points per game, weighted by fixture difficulty"
          players={players}
          teams={teamsWithFixtures}
          teamShortNames={teamShortNames}
          nextGameweek={nextGameweek}
        />
        <PicksCard
          title="Differentials"
          description={`Under ${DIFFERENTIAL_MAX_SELECTED}% owned, with the best projection over the next ${RUN_LENGTH} gameweeks`}
          players={players}
          teams={teamsWithFixtures}
          teamShortNames={teamShortNames}
          nextGameweek={nextGameweek}
          filter={isDifferential}
        />
      </div>
    </>
  )
}

type PicksCardProps = {
  title: string
  description: string
  players: Player[]
  teams: TeamWithFixtures[]
  teamShortNames: Map<number, string>
  nextGameweek: number
  filter?: (player: Player) => boolean
}

/**
 * Players ranked by projected points over the next run, filterable by position.
 */
function PicksCard({
  title,
  description,
  players,
  teams,
  teamShortNames,
  nextGameweek,
  filter = () => true,
}: PicksCardProps) {
  const [position, setPosition] = useState<PositionFilter>('all')
  const picks = rankPicks(
    players,
    teams,
    nextGameweek,
    RUN_LENGTH,
    (player) => (position === 'all' || player.element_type === position) && filter(player),
  ).slice(0, CARD_COUNT)

  return (
    <PlayerListCard
      title={title}
      description={description}
      teamShortNames={teamShortNames}
      controls={
        <BaseSegmentedButtons aria-label={`${title} position`}>
          {POSITION_FILTER_OPTIONS.map(({ value, label }) => (
            <BaseSegmentedButton
              key={value}
              selected={position === value}
              onClick={() => setPosition(value)}
            >
              {label}
            </BaseSegmentedButton>
          ))}
        </BaseSegmentedButtons>
      }
      rows={picks.map(({ player, fixtures, projectedPoints }) => ({
        player,
        value: <span title="Projected points over the run">{projectedPoints.toFixed(1)}</span>,
        extra: <FixtureChips fixtures={fixtures} />,
      }))}
    />
  )
}

function FixtureChips({ fixtures }: { fixtures: TeamFixture[] }) {
  return (
    <span className="overview-fixtures">
      {fixtures.map((fixture) => (
        <span
          key={fixture.fixture_id}
          className="overview-fixture"
          style={{ background: fixture.opponent.rating_total_color }}
          title={`GW ${fixture.event}: ${fixture.opponent.team_name} (${fixture.is_home ? 'home' : 'away'})`}
        >
          {fixture.opponent.team_name_short} ({fixture.is_home ? 'H' : 'A'})
        </span>
      ))}
    </span>
  )
}

export default OverviewPage
