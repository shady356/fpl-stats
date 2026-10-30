import type { TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Player } from '@/types/player.ts'

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
