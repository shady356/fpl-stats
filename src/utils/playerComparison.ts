import type { Player, PlayerPosition } from '@/types/player.ts'

/** The most players compared at once. */
export const MAX_COMPARED_PLAYERS = 3

/**
 * One row of the player comparison, mirroring the season stats on the player page.
 */
export type ComparisonStat = {
  key: string
  label: string
  /** Longer explanation shown on hover. */
  tooltip?: string
  /** Value to compare by. */
  value: (player: Player) => number
  /** Cell text; the raw value when unset. */
  format?: (player: Player) => string
  /** Highlight the higher value; off for stats where more isn't simply better, like cards. */
  compared: boolean
  /** Positions the stat applies to; every position when unset. */
  positions?: PlayerPosition[]
}

function formatPrice(tenths: number): string {
  return `£${(tenths / 10).toFixed(1)}m`
}

const transferFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function formatChange(tenths: number): string {
  return `${tenths >= 0 ? '+' : '-'}£${(Math.abs(tenths) / 10).toFixed(1)}m`
}

const OUTFIELD: PlayerPosition[] = [2, 3, 4]

/** Ordered like the player page: general, attack, defence, discipline, then the market. */
export const COMPARISON_STATS: ComparisonStat[] = [
  {
    key: 'total_points',
    label: 'Points',
    tooltip: 'Total points this season',
    value: (player) => player.total_points,
    compared: true,
  },
  {
    key: 'form',
    label: 'Form',
    tooltip: 'Average points per game over the last 30 days',
    value: (player) => Number(player.form),
    format: (player) => player.form,
    compared: true,
  },
  {
    key: 'minutes',
    label: 'Minutes',
    value: (player) => player.minutes,
    compared: true,
  },
  {
    key: 'starts',
    label: 'Starts',
    value: (player) => player.starts,
    compared: true,
  },
  {
    key: 'bonus',
    label: 'Bonus',
    tooltip: 'Bonus points: 3, 2 and 1 for the top three BPS scores in each match',
    value: (player) => player.bonus,
    compared: true,
  },
  {
    key: 'goals_scored',
    label: 'Goals',
    value: (player) => player.goals_scored,
    compared: true,
  },
  {
    key: 'expected_goals',
    label: 'xG',
    tooltip: 'Expected goals',
    value: (player) => Number(player.expected_goals),
    format: (player) => player.expected_goals,
    compared: true,
  },
  {
    key: 'assists',
    label: 'Assists',
    value: (player) => player.assists,
    compared: true,
  },
  {
    key: 'expected_assists',
    label: 'xA',
    tooltip: 'Expected assists',
    value: (player) => Number(player.expected_assists),
    format: (player) => player.expected_assists,
    compared: true,
  },
  {
    key: 'saves',
    label: 'Saves',
    value: (player) => player.saves,
    compared: true,
    positions: [1],
  },
  {
    key: 'defensive_contribution',
    label: 'DefCon',
    tooltip: 'Defensive contributions',
    value: (player) => player.defensive_contribution,
    compared: true,
    positions: OUTFIELD,
  },
  {
    key: 'yellow_cards',
    label: 'Yellow cards',
    value: (player) => player.yellow_cards,
    compared: false,
  },
  {
    key: 'red_cards',
    label: 'Red cards',
    value: (player) => player.red_cards,
    compared: false,
  },
  {
    key: 'now_cost',
    label: 'Price',
    value: (player) => player.now_cost,
    format: (player) => formatPrice(player.now_cost),
    compared: false,
  },
  {
    key: 'cost_change_start',
    label: 'Price change',
    tooltip: 'Since the start of the season',
    value: (player) => player.cost_change_start,
    format: (player) => formatChange(player.cost_change_start),
    compared: false,
  },
  {
    key: 'selected_by_percent',
    label: 'Owned',
    tooltip: 'Percentage of FPL managers who own the player',
    value: (player) => Number(player.selected_by_percent),
    format: (player) => `${player.selected_by_percent}%`,
    compared: false,
  },
  {
    key: 'transfers_in_event',
    label: 'Transfers in',
    tooltip: 'Managers who brought the player in this gameweek',
    value: (player) => player.transfers_in_event,
    format: (player) => transferFormat.format(player.transfers_in_event),
    compared: false,
  },
  {
    key: 'transfers_out_event',
    label: 'Transfers out',
    tooltip: 'Managers who sold the player this gameweek',
    value: (player) => player.transfers_out_event,
    format: (player) => transferFormat.format(player.transfers_out_event),
    compared: false,
  },
]

/**
 * The comparison rows that apply to a position.
 * @param position - The position of both players.
 * @returns The stats, in display order.
 */
export function comparisonStats(position: PlayerPosition): ComparisonStat[] {
  return COMPARISON_STATS.filter((stat) => !stat.positions || stat.positions.includes(position))
}

/**
 * Which players are best at a stat.
 * @param stat - The stat to compare.
 * @param players - The players being compared.
 * @returns Ids of the players sharing the highest value; empty when they all tie or the stat
 *   isn't compared.
 */
export function bestPlayerIds(stat: ComparisonStat, players: Player[]): number[] {
  if (!stat.compared) return []
  const values = players.map((player) => stat.value(player))
  const best = Math.max(...values)
  if (values.every((value) => value === best)) return []
  return players.filter((_, index) => values[index] === best).map((player) => player.id)
}

/**
 * Read the compared players from the `ids` URL param, e.g. "124,68".
 * @param param - The param's value; null when missing.
 * @returns Up to MAX_COMPARED_PLAYERS distinct ids, in order, skipping anything that isn't an id.
 */
export function parseComparedIds(param: string | null): number[] {
  const ids = (param ?? '')
    .split(',')
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0)
  return [...new Set(ids)].slice(0, MAX_COMPARED_PLAYERS)
}

/**
 * Link to the comparison page.
 * @param ids - Ids of the players to compare.
 * @returns The page's path, with the players in the URL.
 */
export function comparisonPath(ids: number[]): string {
  return ids.length === 0 ? '/compare' : `/compare?ids=${ids.join(',')}`
}
