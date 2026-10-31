import type { Player } from '@/types/player.ts'
import { formColor } from '@/utils/playerForm.ts'

export type PlayerColumnKey =
  | 'web_name'
  | 'team'
  | 'now_cost'
  | 'cost_change_start'
  | 'total_points'
  | 'points_per_game'
  | 'form'
  | 'minutes'
  | 'goals_scored'
  | 'assists'
  | 'expected_goals'
  | 'expected_assists'
  | 'clean_sheets'
  | 'defensive_contribution'
  | 'bonus'
  | 'selected_by_percent'

export type PlayerColumn = {
  key: PlayerColumnKey
  label: string
  tooltip: string
  align: 'left' | 'right'
  /** Value to sort by; strings sort alphabetically. */
  value: (player: Player, teamShortNames: Map<number, string>) => number | string
  /** Cell text; the raw value when unset. */
  format?: (player: Player) => string
  /** Cell text color, e.g. to grade the value; the row's color when unset. */
  color?: (player: Player) => string
}

function formatPrice(tenths: number): string {
  return `£${(tenths / 10).toFixed(1)}m`
}

export const PLAYER_COLUMNS: PlayerColumn[] = [
  {
    key: 'web_name',
    label: 'Player',
    tooltip: 'Player',
    align: 'left',
    value: (player) => player.web_name,
  },
  {
    key: 'team',
    label: 'Team',
    tooltip: 'Team',
    align: 'left',
    value: (player, teamShortNames) => teamShortNames.get(player.team) ?? '',
  },
  {
    key: 'now_cost',
    label: 'Price',
    tooltip: 'Price',
    align: 'right',
    value: (player) => player.now_cost,
    format: (player) => formatPrice(player.now_cost),
  },
  {
    key: 'cost_change_start',
    label: '+/-',
    tooltip: 'Price change since the start of the season',
    align: 'right',
    value: (player) => player.cost_change_start,
    format: (player) =>
      `${player.cost_change_start > 0 ? '+' : ''}${(player.cost_change_start / 10).toFixed(1)}`,
  },
  {
    key: 'total_points',
    label: 'Pts',
    tooltip: 'Total points',
    align: 'right',
    value: (player) => player.total_points,
  },
  {
    key: 'points_per_game',
    label: 'PPG',
    tooltip: 'Points per game',
    align: 'right',
    value: (player) => Number(player.points_per_game),
    format: (player) => player.points_per_game,
  },
  {
    key: 'form',
    label: 'Form',
    tooltip: 'Average points per game over the last 30 days',
    align: 'right',
    value: (player) => Number(player.form),
    format: (player) => player.form,
    color: (player) => formColor(Number(player.form)),
  },
  {
    key: 'minutes',
    label: 'Min',
    tooltip: 'Minutes played',
    align: 'right',
    value: (player) => player.minutes,
  },
  {
    key: 'goals_scored',
    label: 'G',
    tooltip: 'Goals',
    align: 'right',
    value: (player) => player.goals_scored,
  },
  {
    key: 'assists',
    label: 'A',
    tooltip: 'Assists',
    align: 'right',
    value: (player) => player.assists,
  },
  {
    key: 'expected_goals',
    label: 'xG',
    tooltip: 'Expected goals',
    align: 'right',
    value: (player) => Number(player.expected_goals),
    format: (player) => player.expected_goals,
  },
  {
    key: 'expected_assists',
    label: 'xA',
    tooltip: 'Expected assists',
    align: 'right',
    value: (player) => Number(player.expected_assists),
    format: (player) => player.expected_assists,
  },
  {
    key: 'clean_sheets',
    label: 'CS',
    tooltip: 'Clean sheets',
    align: 'right',
    value: (player) => player.clean_sheets,
  },
  {
    key: 'defensive_contribution',
    label: 'DC',
    tooltip: 'Defensive contributions',
    align: 'right',
    value: (player) => player.defensive_contribution,
  },
  {
    key: 'bonus',
    label: 'Bonus',
    tooltip: 'Bonus points: 3, 2 and 1 for the top three BPS scores in each match',
    align: 'right',
    value: (player) => player.bonus,
  },
  {
    key: 'selected_by_percent',
    label: 'Sel.',
    tooltip: 'Percentage of FPL managers who own the player',
    align: 'right',
    value: (player) => Number(player.selected_by_percent),
    format: (player) => `${player.selected_by_percent}%`,
  },
]

/**
 * Sort players by a column, breaking ties in number columns by total points.
 */
export function sortPlayers(
  players: Player[],
  key: PlayerColumnKey,
  order: 'asc' | 'desc',
  teamShortNames: Map<number, string>,
): Player[] {
  const { value } = PLAYER_COLUMNS.find((column) => column.key === key)!
  const direction = order === 'asc' ? 1 : -1
  return players.toSorted((a, b) => {
    const aVal = value(a, teamShortNames)
    const bVal = value(b, teamShortNames)
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * direction || b.total_points - a.total_points
    }
    return String(aVal).localeCompare(String(bVal)) * direction
  })
}

/** Text columns (the left-aligned ones) read best A-Z, numbers highest first. */
export function defaultSortOrder(key: PlayerColumnKey): 'asc' | 'desc' {
  const column = PLAYER_COLUMNS.find((column) => column.key === key)!
  return column.align === 'left' ? 'asc' : 'desc'
}

export function isPlayerColumnKey(key: string | null): key is PlayerColumnKey {
  return PLAYER_COLUMNS.some((column) => column.key === key)
}
