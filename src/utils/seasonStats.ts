import type { EntryHistory, EntryPicks, GameweekHistory, LivePlayerStats } from '@/types/myTeam'
import type { Player } from '@/types/player'

/** FPL's starting budget, in tenths of a million. */
const STARTING_BUDGET = 1000
const STARTING_XI_SIZE = 11
const TOP_PLAYERS = 5

/**
 * A manager's picks and every player's stats for one gameweek.
 */
export type SeasonGameweek = {
  entryPicks: EntryPicks
  live: Map<number, LivePlayerStats>
}

/**
 * Points a player has earned for the manager, captaincy included.
 */
export type PlayerContribution = {
  element: number
  /** undefined if the player is missing from bootstrap-static. */
  player: Player | undefined
  points: number
}

/**
 * Season highlights, as built by computeSeasonStats.
 */
export type SeasonStats = {
  /** Points left on the bench across the season, Bench Boost gameweeks excluded. */
  benchPoints: number
  /** undefined if Bench Boost hasn't been played. */
  benchBoost: { gameweek: number; points: number } | undefined
  /** undefined before any gameweek is ranked. */
  bestRank: GameweekHistory | undefined
  /** undefined before any gameweek is played. */
  bestScore: GameweekHistory | undefined
  /** Points scored by captains, multiplier included. */
  captainPoints: number
  /** Most points earned for the manager, highest first. */
  topPlayers: PlayerContribution[]
  /** Team value including the bank, in tenths of a million. */
  teamValue: number
  /** Change in team value since the start of the season, in tenths of a million. */
  teamValueChange: number
  bank: number
  transfers: number
  hitsCost: number
}

/**
 * Compute season highlights from the manager's history and every gameweek's picks.
 * @param history - The manager's season history.
 * @param gameweeks - Picks and live stats for each gameweek played.
 * @param players - All players from bootstrap-static.
 * @returns The season stats.
 */
export function computeSeasonStats(
  history: EntryHistory,
  gameweeks: SeasonGameweek[],
  players: Player[],
): SeasonStats {
  const results = history.current
  const latest = results.at(-1)

  const ranked = results.filter((result) => result.rank !== null)
  const bestRank = ranked.reduce<GameweekHistory | undefined>(
    (best, result) => (!best || result.rank! < best.rank! ? result : best),
    undefined,
  )
  const bestScore = results.reduce<GameweekHistory | undefined>(
    (best, result) => (!best || result.points > best.points ? result : best),
    undefined,
  )

  const playersById = new Map(players.map((player) => [player.id, player]))
  const contributions = new Map<number, number>()
  let captainPoints = 0
  let benchBoost: SeasonStats['benchBoost']

  for (const { entryPicks, live } of gameweeks) {
    for (const pick of entryPicks.picks) {
      const points = (live.get(pick.element)?.total_points ?? 0) * pick.multiplier
      contributions.set(pick.element, (contributions.get(pick.element) ?? 0) + points)
      if (pick.is_captain) captainPoints += points
    }

    if (entryPicks.active_chip === 'bboost') {
      benchBoost = {
        gameweek: entryPicks.entry_history.event,
        points: entryPicks.picks
          .filter((pick) => pick.position > STARTING_XI_SIZE)
          .reduce((sum, pick) => sum + (live.get(pick.element)?.total_points ?? 0), 0),
      }
    }
  }

  const topPlayers = [...contributions]
    .map(([element, points]) => ({ element, player: playersById.get(element), points }))
    .sort((a, b) => b.points - a.points)
    .slice(0, TOP_PLAYERS)

  return {
    benchPoints: results.reduce((sum, result) => sum + result.points_on_bench, 0),
    benchBoost,
    bestRank,
    bestScore,
    captainPoints,
    topPlayers,
    teamValue: latest?.value ?? STARTING_BUDGET,
    teamValueChange: (latest?.value ?? STARTING_BUDGET) - STARTING_BUDGET,
    bank: latest?.bank ?? 0,
    transfers: results.reduce((sum, result) => sum + result.event_transfers, 0),
    hitsCost: results.reduce((sum, result) => sum + result.event_transfers_cost, 0),
  }
}
