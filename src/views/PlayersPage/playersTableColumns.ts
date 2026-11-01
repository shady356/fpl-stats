import type { Player } from '@/types/player.ts'
import { formColor } from '@/utils/playerForm.ts'

export type PlayerColumnKey =
  | 'web_name'
  | 'element_type'
  | 'form'
  | 'now_cost'
  | 'cost_change_start'
  | 'total_points'
  | 'points_per_game'
  | 'minutes'
  | 'goals_scored'
  | 'assists'
  | 'expected_goals'
  | 'expected_assists'
  | 'clean_sheets'
  | 'defensive_contribution'
  | 'bonus'
  | 'transfers_in_event'
  | 'transfers_out_event'
  | 'selected_by_percent'

export type PlayerColumn = {
  key: PlayerColumnKey
  label: string
  tooltip: string
  align: 'left' | 'right'
  /** Value to sort by; strings sort alphabetically. */
  value: (player: Player) => number | string
  /** Cell text; the raw value when unset. */
  format?: (player: Player) => string
  /** Cell text color, e.g. to grade the value; the row's color when unset. */
  color?: (player: Player) => string
  /** Related columns sit together and are set apart from their neighbors by lines. */
  section?: 'attack' | 'defence' | 'transfers'
}

function formatPrice(tenths: number): string {
  return `£${(tenths / 10).toFixed(1)}m`
}

const transferFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const PLAYER_COLUMNS: PlayerColumn[] = [
  {
    key: 'web_name',
    label: 'Player',
    tooltip: 'Player',
    align: 'left',
    value: (player) => player.web_name,
  },
  {
    key: 'element_type',
    label: 'Pos',
    tooltip: 'Position',
    align: 'left',
    value: (player) => player.element_type,
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
    key: 'bonus',
    label: 'Bonus',
    tooltip: 'Bonus points: 3, 2 and 1 for the top three BPS scores in each match',
    align: 'right',
    value: (player) => player.bonus,
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
    section: 'attack',
    value: (player) => player.goals_scored,
  },
  {
    key: 'expected_goals',
    label: 'xG',
    tooltip: 'Expected goals',
    align: 'right',
    section: 'attack',
    value: (player) => Number(player.expected_goals),
    format: (player) => player.expected_goals,
  },
  {
    key: 'assists',
    label: 'A',
    tooltip: 'Assists',
    align: 'right',
    section: 'attack',
    value: (player) => player.assists,
  },
  {
    key: 'expected_assists',
    label: 'xA',
    tooltip: 'Expected assists',
    align: 'right',
    section: 'attack',
    value: (player) => Number(player.expected_assists),
    format: (player) => player.expected_assists,
  },
  {
    key: 'clean_sheets',
    label: 'CS',
    tooltip: 'Clean sheets',
    align: 'right',
    section: 'defence',
    value: (player) => player.clean_sheets,
  },
  {
    key: 'defensive_contribution',
    label: 'DC',
    tooltip: 'Defensive contributions',
    align: 'right',
    section: 'defence',
    value: (player) => player.defensive_contribution,
  },
  {
    key: 'selected_by_percent',
    label: 'Sel.',
    tooltip: 'Percentage of FPL managers who own the player',
    align: 'right',
    value: (player) => Number(player.selected_by_percent),
    format: (player) => `${player.selected_by_percent}%`,
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
    color: (player) => {
      if (player.cost_change_start > 0) return 'var(--defender-color)'
      if (player.cost_change_start < 0) return 'var(--forward-color)'
      return 'inherit'
    },
  },
  {
    key: 'transfers_in_event',
    label: 'In',
    tooltip: 'Managers who brought the player in this gameweek',
    align: 'right',
    section: 'transfers',
    value: (player) => player.transfers_in_event,
    format: (player) => transferFormat.format(player.transfers_in_event),
  },
  {
    key: 'transfers_out_event',
    label: 'Out',
    tooltip: 'Managers who sold the player this gameweek',
    align: 'right',
    section: 'transfers',
    value: (player) => player.transfers_out_event,
    format: (player) => transferFormat.format(player.transfers_out_event),
  },
]

/**
 * Whether a line goes before the column at this index: where a section starts, or where one ends.
 */
export function startsSection(index: number): boolean {
  const section = PLAYER_COLUMNS[index].section
  const previous = PLAYER_COLUMNS[index - 1]?.section
  return index > 0 && section !== previous && (section ?? previous) !== undefined
}

/** Players are sorted by form until another column is picked. */
export const DEFAULT_SORT_KEY: PlayerColumnKey = 'form'

/**
 * Sort players by a column, breaking ties in number columns by total points.
 */
export function sortPlayers(
  players: Player[],
  key: PlayerColumnKey,
  order: 'asc' | 'desc',
): Player[] {
  const { value } = PLAYER_COLUMNS.find((column) => column.key === key)!
  const direction = order === 'asc' ? 1 : -1
  return players.toSorted((a, b) => {
    const aVal = value(a)
    const bVal = value(b)
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
