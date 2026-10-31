import { Suspense, use, useState } from 'react'

import BaseSegmentedButton from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButton.tsx'
import BaseSegmentedButtons from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButtons.tsx'
import Icon from '@/components/ui/Icon/Icon'
import { usePlayers } from '@/hooks/usePlayers'
import { fetchFixtures } from '@/services/FplAPI'
import type { TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Player, PlayerPosition } from '@/types/player'
import type { Team } from '@/types/team.ts'
import {
  DIFFERENTIAL_MAX_SELECTED,
  dueAReturn,
  flaggedPlayers,
  isDifferential,
  mostTransferred,
  priceChanges,
  rankDefensiveContributors,
  rankPicks,
} from '@/utils/playerPicks.ts'
import { POSITION_SHORT_LABELS } from '@/utils/positions'
import { getTeamFixtureList } from '@/utils/teamFixtures.ts'

import './OverviewPage.css'

import PlayerListCard, { type PlayerListRow } from './components/PlayerListCard.tsx'

const fixturesPromise = fetchFixtures()

/** Gameweeks the recommendations look ahead. */
const RUN_LENGTH = 3

/** Players shown in each card. */
const CARD_COUNT = 6

const transferFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

type Option<T> = { value: T; label: string }

type PositionFilter = 'all' | PlayerPosition

/**
 * Segmented-button options for a position filter.
 * @param positions - The positions to offer after 'All'.
 * @returns The options.
 */
function positionFilterOptions(positions: PlayerPosition[]): Option<PositionFilter>[] {
  return [
    { value: 'all', label: 'All' },
    ...positions.map((position) => ({ value: position, label: POSITION_SHORT_LABELS[position] })),
  ]
}

const POSITION_FILTER_OPTIONS = positionFilterOptions([1, 2, 3, 4])

/** Goalkeepers can't earn defensive contribution points and rarely get goal involvements. */
const OUTFIELD_FILTER_OPTIONS = positionFilterOptions([2, 3, 4])

/**
 * Whether a player plays in the filtered position.
 */
function matchesPosition(player: Player, position: PositionFilter): boolean {
  return position === 'all' || player.element_type === position
}

const STATUS_LABELS: Record<string, string> = {
  d: 'Doubtful',
  i: 'Injured',
  s: 'Suspended',
}

/**
 * Format a price change in tenths of a million, e.g. +£0.1m.
 */
function formatPriceChange(change: number): string {
  return `${change > 0 ? '+' : '-'}£${(Math.abs(change) / 10).toFixed(1)}m`
}

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
        <span className="overview-gameweeks" title="Gameweeks the picks look ahead to">
          <Icon icon="calendar_month" filled={false} />
          GW {nextGameweek}–{lastGameweek}
        </span>
      </div>

      {/* Main lists on the left two thirds, quick-glance lists on the right third. */}
      <div className="overview-grid">
        <PicksCard
          players={players}
          teams={teamsWithFixtures}
          teamShortNames={teamShortNames}
          nextGameweek={nextGameweek}
          lastGameweek={lastGameweek}
        />
        <InjuryCard players={players} teamShortNames={teamShortNames} />
        <PerformanceCard players={players} teamShortNames={teamShortNames} />
        <MarketCard players={players} teamShortNames={teamShortNames} />
      </div>
    </>
  )
}

type CardProps = {
  players: Player[]
  teamShortNames: Map<number, string>
}

type PicksView = 'captain' | 'run' | 'differentials'

type PicksCardProps = CardProps & {
  teams: TeamWithFixtures[]
  nextGameweek: number
  lastGameweek: number
}

/**
 * Players ranked by projected points, as captains for the next gameweek, over the
 * next run, or among differentials. Filterable by position.
 */
function PicksCard({ players, teams, teamShortNames, nextGameweek, lastGameweek }: PicksCardProps) {
  const [view, setView] = useState<PicksView>('run')
  const [position, setPosition] = useState<PositionFilter>('all')

  const views: Record<PicksView, { label: string; icon: string; description: string }> = {
    captain: {
      label: 'Captain',
      icon: 'military_tech',
      description: `Highest projection for GW ${nextGameweek} alone`,
    },
    run: {
      label: `GW ${nextGameweek}–${lastGameweek}`,
      icon: 'recommend',
      description: 'Form and points per game, weighted by fixture difficulty',
    },
    differentials: {
      label: 'Differentials',
      icon: 'diamond',
      description: `Under ${DIFFERENTIAL_MAX_SELECTED}% owned, best projection over the next ${RUN_LENGTH} gameweeks`,
    },
  }

  const picks = rankPicks(
    players,
    teams,
    nextGameweek,
    view === 'captain' ? 1 : RUN_LENGTH,
    (player) =>
      matchesPosition(player, position) && (view !== 'differentials' || isDifferential(player)),
  ).slice(0, CARD_COUNT)

  return (
    <PlayerListCard
      className="overview-wide"
      title="Top picks"
      icon={views[view].icon}
      description={views[view].description}
      teamShortNames={teamShortNames}
      controls={
        <>
          <OptionButtons
            label="Pick type"
            options={Object.entries(views).map(([value, { label }]) => ({
              value: value as PicksView,
              label,
            }))}
            value={view}
            onChange={setView}
          />
          <OptionButtons
            label="Position"
            options={POSITION_FILTER_OPTIONS}
            value={position}
            onChange={setPosition}
          />
        </>
      }
      rows={picks.map(({ player, fixtures, projectedPoints }) => ({
        player,
        value: <span title="Projected points">{projectedPoints.toFixed(1)}</span>,
        extra: <FixtureChips fixtures={fixtures} />,
      }))}
    />
  )
}

/**
 * Doubtful, injured and suspended players, most owned first.
 */
function InjuryCard({ players, teamShortNames }: CardProps) {
  return (
    <PlayerListCard
      className="overview-narrow"
      title="Injury news"
      icon="medical_services"
      description="Flagged players, most owned first"
      tone="negative"
      emptyText="No flagged players."
      teamShortNames={teamShortNames}
      rows={flaggedPlayers(players, CARD_COUNT).map((player) => {
        const chance = player.chance_of_playing_next_round
        return {
          player,
          value: (
            <span
              className={chance !== null && chance >= 50 ? 'overview-chance-likely' : undefined}
              title="Chance of playing next gameweek"
            >
              {chance === null ? STATUS_LABELS[player.status] : `${chance}%`}
            </span>
          ),
          extra: player.news && (
            <span className="overview-news" title={player.news}>
              {player.news}
            </span>
          ),
        }
      })}
    />
  )
}

type PerformanceView = 'returns' | 'defensive'

/**
 * Underlying numbers: attackers due a return and defensive contribution points.
 */
function PerformanceCard({ players, teamShortNames }: CardProps) {
  const [view, setView] = useState<PerformanceView>('returns')
  const [position, setPosition] = useState<PositionFilter>('all')
  const filtered = players.filter((player) => matchesPosition(player, position))

  const rows: PlayerListRow[] =
    view === 'returns'
      ? dueAReturn(filtered, CARD_COUNT).map(({ player, xgi, gi }) => ({
          player,
          value: <span title="xGI minus goals and assists">+{(xgi - gi).toFixed(1)}</span>,
          extra: (
            <span className="overview-stat-line">
              {xgi.toFixed(1)} xGI · {gi} G+A
            </span>
          ),
        }))
      : rankDefensiveContributors(filtered)
          .slice(0, CARD_COUNT)
          .map(({ player, per90, threshold }) => ({
            player,
            value: (
              <span
                className={per90 >= threshold ? 'overview-dc-above' : undefined}
                title="Defensive contributions per 90"
              >
                {per90.toFixed(1)}
              </span>
            ),
            extra: (
              <span className="overview-dc">
                <span className="overview-dc-meter">
                  <span
                    className="overview-dc-fill"
                    style={{ width: `${Math.min(per90 / threshold, 1) * 100}%` }}
                  />
                </span>
                <span className="overview-stat-line">
                  {Math.round((per90 / threshold) * 100)}% of {threshold} ·{' '}
                  {player.defensive_contribution} total
                </span>
              </span>
            ),
          }))

  return (
    <PlayerListCard
      className="overview-wide"
      title="Underlying numbers"
      icon={view === 'returns' ? 'sports_soccer' : 'shield'}
      description={
        view === 'returns'
          ? 'Goals and assists furthest behind their xG and xA'
          : 'Per 90, against the 10 (DEF) or 12 (MID, FWD) needed a match for 2 points'
      }
      tone={view === 'returns' ? 'positive' : undefined}
      teamShortNames={teamShortNames}
      controls={
        <>
          <OptionButtons
            label="Statistic"
            options={[
              { value: 'returns', label: 'Due a return' },
              { value: 'defensive', label: 'Defensive contributions' },
            ]}
            value={view}
            onChange={setView}
          />
          <OptionButtons
            label="Position"
            options={OUTFIELD_FILTER_OPTIONS}
            value={position}
            onChange={setPosition}
          />
        </>
      }
      rows={rows}
    />
  )
}

type MarketView = 'in' | 'out' | 'rise' | 'fall'

const MARKET_VIEWS: Record<
  MarketView,
  { label: string; icon: string; description: string; emptyText?: string }
> = {
  in: { label: 'In', icon: 'login', description: 'Most transferred in this gameweek' },
  out: { label: 'Out', icon: 'logout', description: 'Most transferred out this gameweek' },
  rise: {
    label: 'Rises',
    icon: 'trending_up',
    description: 'Price rises this gameweek',
    emptyText: 'No price rises yet.',
  },
  fall: {
    label: 'Falls',
    icon: 'trending_down',
    description: 'Price drops this gameweek',
    emptyText: 'No price drops yet.',
  },
}

/**
 * Where managers are moving: transfers in and out, and the price changes they cause.
 */
function MarketCard({ players, teamShortNames }: CardProps) {
  const [view, setView] = useState<MarketView>('in')

  const rows: PlayerListRow[] =
    view === 'in' || view === 'out'
      ? mostTransferred(players, view, CARD_COUNT).map((player) => ({
          player,
          value:
            view === 'in'
              ? `+${transferFormat.format(player.transfers_in_event)}`
              : `-${transferFormat.format(player.transfers_out_event)}`,
        }))
      : priceChanges(players, view, CARD_COUNT).map((player) => ({
          player,
          value: formatPriceChange(player.cost_change_event),
        }))

  return (
    <PlayerListCard
      className="overview-narrow"
      title="Transfer market"
      icon={MARKET_VIEWS[view].icon}
      description={MARKET_VIEWS[view].description}
      emptyText={MARKET_VIEWS[view].emptyText}
      tone={view === 'in' || view === 'rise' ? 'positive' : 'negative'}
      teamShortNames={teamShortNames}
      controls={
        <OptionButtons
          label="Market view"
          options={Object.entries(MARKET_VIEWS).map(([value, { label }]) => ({
            value: value as MarketView,
            label,
          }))}
          value={view}
          onChange={setView}
        />
      }
      rows={rows}
    />
  )
}

type OptionButtonsProps<T> = {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

function OptionButtons<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: OptionButtonsProps<T>) {
  return (
    <BaseSegmentedButtons aria-label={label}>
      {options.map((option) => (
        <BaseSegmentedButton
          key={option.value}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </BaseSegmentedButton>
      ))}
    </BaseSegmentedButtons>
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
