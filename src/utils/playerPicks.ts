import type { TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Player, PlayerPosition } from '@/types/player.ts'

/** Players with fewer minutes than this are too small a sample to recommend. */
export const MIN_MINUTES = 270

/** Players owned by fewer managers than this (in %) count as differentials. */
export const DIFFERENTIAL_MAX_SELECTED = 5

/**
 * A player recommended for an upcoming run of gameweeks.
 */
export type PlayerPick = {
  player: Player
  /** The player's team fixtures in the run, in kickoff order. */
  fixtures: TeamFixture[]
  /** Expected points over the run. */
  projectedPoints: number
}

/**
 * Players ranked by transfers this gameweek.
 * @param players - All players; not modified.
 * @param direction - 'in' for most bought, 'out' for most sold.
 * @param count - How many to return.
 * @returns The most transferred players, most first.
 */
export function mostTransferred(
  players: Player[],
  direction: 'in' | 'out',
  count: number,
): Player[] {
  const transfers = (player: Player) =>
    direction === 'in' ? player.transfers_in_event : player.transfers_out_event

  return players
    .filter((player) => transfers(player) > 0)
    .toSorted((a, b) => transfers(b) - transfers(a))
    .slice(0, count)
}

/**
 * Expected points per game, blending recent form with the season average so one
 * big haul doesn't dominate.
 * @param player - The player.
 * @returns Points per game.
 */
export function expectedPointsPerGame(player: Player): number {
  return Number(player.form) * 0.6 + Number(player.points_per_game) * 0.4
}

/**
 * How much easier (above 1) or harder (below 1) an opponent makes scoring.
 * @param opponentRating - The opponent's total rating (0-100); 50 is an average team.
 * @returns A multiplier from 0.5 (best team) to 1.5 (worst team).
 */
export function fixtureMultiplier(opponentRating: number): number {
  return 1 + (50 - opponentRating) / 100
}

/**
 * Expected points over a run of gameweeks: points per game scaled by each
 * opponent's strength, so double gameweeks count twice and blanks count nothing.
 * @param player - The player.
 * @param fixtures - The player's team fixtures in the run.
 * @returns Projected points.
 */
export function projectPoints(player: Player, fixtures: TeamFixture[]): number {
  const perGame = expectedPointsPerGame(player)
  return fixtures.reduce(
    (total, fixture) => total + perGame * fixtureMultiplier(fixture.opponent.rating_total),
    0,
  )
}

/**
 * Available, regular players ranked by projected points over a run of gameweeks.
 * @param players - All players; not modified.
 * @param teams - Teams with their upcoming fixtures.
 * @param firstGameweek - First gameweek of the run.
 * @param gameweeks - Number of gameweeks in the run.
 * @param filter - Extra condition a player must meet, e.g. low ownership.
 * @returns Picks, highest projection first.
 */
export function rankPicks(
  players: Player[],
  teams: TeamWithFixtures[],
  firstGameweek: number,
  gameweeks: number,
  filter: (player: Player) => boolean = () => true,
): PlayerPick[] {
  const fixturesByTeam = new Map(
    teams.map((team) => [
      team.team_id,
      team.fixtures.filter(
        (fixture) => fixture.event >= firstGameweek && fixture.event < firstGameweek + gameweeks,
      ),
    ]),
  )

  return players
    .filter((player) => player.status === 'a' && player.minutes >= MIN_MINUTES && filter(player))
    .map((player) => {
      const fixtures = fixturesByTeam.get(player.team) ?? []
      return { player, fixtures, projectedPoints: projectPoints(player, fixtures) }
    })
    .filter((pick) => pick.projectedPoints > 0)
    .toSorted((a, b) => b.projectedPoints - a.projectedPoints)
}

/**
 * Whether few enough managers own the player for them to be a differential.
 * @param player - The player.
 * @returns True if owned by under DIFFERENTIAL_MAX_SELECTED percent.
 */
export function isDifferential(player: Player): boolean {
  return Number(player.selected_by_percent) < DIFFERENTIAL_MAX_SELECTED
}

/**
 * Players whose price changed this gameweek, biggest change first.
 * @param players - All players; not modified.
 * @param direction - 'rise' for price rises, 'fall' for drops.
 * @param count - How many to return.
 * @returns The players, ties broken by ownership.
 */
export function priceChanges(
  players: Player[],
  direction: 'rise' | 'fall',
  count: number,
): Player[] {
  const change = (player: Player) =>
    direction === 'rise' ? player.cost_change_event : -player.cost_change_event

  return players
    .filter((player) => change(player) > 0)
    .toSorted(
      (a, b) =>
        change(b) - change(a) || Number(b.selected_by_percent) - Number(a.selected_by_percent),
    )
    .slice(0, count)
}

/** Statuses that mean a player may miss the next match. Loans and transfers ('u', 'n') are left out. */
const FLAGGED_STATUSES = new Set(['d', 'i', 's'])

/**
 * Doubtful, injured and suspended players, most owned first, since those affect
 * the most managers.
 * @param players - All players; not modified.
 * @param count - How many to return.
 * @returns The flagged players.
 */
export function flaggedPlayers(players: Player[], count: number): Player[] {
  return players
    .filter((player) => FLAGGED_STATUSES.has(player.status))
    .toSorted((a, b) => Number(b.selected_by_percent) - Number(a.selected_by_percent))
    .slice(0, count)
}

/**
 * Defensive contributions needed in a match for the 2 bonus points: clearances,
 * blocks, interceptions and tackles for defenders, plus recoveries for midfielders
 * and forwards. Goalkeepers can't earn them.
 */
export const DEFENSIVE_CONTRIBUTION_THRESHOLDS: Record<Exclude<PlayerPosition, 1>, number> = {
  2: 10,
  3: 12,
  4: 12,
}

/**
 * A player ranked by defensive contributions.
 */
export type DefensiveContributor = {
  player: Player
  /** Defensive contributions per 90 minutes. */
  per90: number
  /** Contributions per match needed for the points at the player's position. */
  threshold: number
}

/**
 * Regular outfield players ranked by defensive contributions per 90 relative to
 * their position's threshold, so defenders and midfielders compare fairly.
 * @param players - All players; not modified.
 * @param filter - Extra condition a player must meet, e.g. a position.
 * @returns Contributors, closest to (or furthest past) the threshold first.
 */
export function rankDefensiveContributors(
  players: Player[],
  filter: (player: Player) => boolean = () => true,
): DefensiveContributor[] {
  return players
    .filter(
      (player) => player.element_type !== 1 && player.minutes >= MIN_MINUTES && filter(player),
    )
    .map((player) => ({
      player,
      per90: (player.defensive_contribution / player.minutes) * 90,
      threshold:
        DEFENSIVE_CONTRIBUTION_THRESHOLDS[player.element_type as Exclude<PlayerPosition, 1>],
    }))
    .toSorted((a, b) => b.per90 / b.threshold - a.per90 / a.threshold)
}

/**
 * A player compared with their expected goal involvements.
 */
export type ExpectedReturn = {
  player: Player
  /** Expected goals plus expected assists this season. */
  xgi: number
  /** Goals plus assists this season. */
  gi: number
}

/**
 * Regular players whose goals and assists trail their xG and xA the most, so are
 * due a return if the chances keep coming.
 * @param players - All players; not modified.
 * @param count - How many to return.
 * @returns The players, biggest shortfall first.
 */
export function dueAReturn(players: Player[], count: number): ExpectedReturn[] {
  return players
    .filter((player) => player.status === 'a' && player.minutes >= MIN_MINUTES)
    .map((player) => ({
      player,
      xgi: Number(player.expected_goals) + Number(player.expected_assists),
      gi: player.goals_scored + player.assists,
    }))
    .filter(({ xgi, gi }) => xgi > gi)
    .toSorted((a, b) => b.xgi - b.gi - (a.xgi - a.gi))
    .slice(0, count)
}
