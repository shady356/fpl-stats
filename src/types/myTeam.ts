import type { Player, PlayerPosition } from '@/types/player'

/**
 * An FPL manager's team, from the `entry/{id}/` endpoint.
 */
export type Entry = {
  id: number
  /** The manager's team name. */
  name: string
  player_first_name: string
  player_last_name: string
  /** The latest gameweek that has started. */
  current_event: number
  player_region_name: string
  summary_overall_points: number
  summary_overall_rank: number | null
}

/**
 * A manager's result for one gameweek.
 */
export type GameweekHistory = {
  event: number
  points: number
  total_points: number
  rank: number | null
  overall_rank: number | null
  /** Money in the bank, in tenths of a million. */
  bank: number
  /** Team value including the bank, in tenths of a million. */
  value: number
  event_transfers: number
  event_transfers_cost: number
  points_on_bench: number
}

/**
 * A chip the manager played.
 */
export type ChipPlay = {
  /** e.g. 'bboost', '3xc', 'freehit', 'wildcard'. */
  name: string
  event: number
}

/**
 * A manager's season so far, from the `entry/{id}/history/` endpoint.
 */
export type EntryHistory = {
  /** One entry per gameweek played this season, oldest first. */
  current: GameweekHistory[]
  chips: ChipPlay[]
}

/**
 * One of the 15 players picked for a gameweek.
 */
export type Pick = {
  /** Player id, the `id` field in bootstrap-static's `elements`. */
  element: number
  /** 1-11 are the starting XI, 12-15 the bench in sub order. Already reflects automatic subs. */
  position: number
  /** 0 on the bench, 1 in the XI, 2 for the captain (3 with triple captain). */
  multiplier: number
  is_captain: boolean
  is_vice_captain: boolean
  element_type: PlayerPosition
}

/**
 * A bench player the game brought on for a starter who didn't play.
 */
export type AutomaticSub = {
  element_in: number
  element_out: number
}

/**
 * A manager's picks for one gameweek, from the `entry/{id}/event/{gw}/picks/` endpoint.
 */
export type EntryPicks = {
  /** e.g. 'bboost', '3xc', 'freehit', 'wildcard'; null when no chip was played. */
  active_chip: string | null
  automatic_subs: AutomaticSub[]
  entry_history: GameweekHistory
  picks: Pick[]
}

/**
 * One player's stats in a gameweek, from the `event/{gw}/live/` endpoint.
 */
export type LivePlayerStats = {
  minutes: number
  /** Points before the captain multiplier. */
  total_points: number
}

/**
 * A picked player with their gameweek stats, as built by buildLineup.
 */
export type LineupPlayer = {
  pick: Pick
  /** undefined if the player is missing from bootstrap-static. */
  player: Player | undefined
  minutes: number
  /** Gameweek points with the captain multiplier applied; bench players show their raw points. */
  points: number
  subbedIn: boolean
  subbedOut: boolean
}

/**
 * A gameweek team split into pitch rows, as built by buildLineup.
 */
export type Lineup = {
  /** Starting XI as goalkeeper, defender, midfielder and forward rows. */
  rows: LineupPlayer[][]
  /** Bench in sub order, goalkeeper first. */
  bench: LineupPlayer[]
}
