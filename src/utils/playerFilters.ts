import type { Player, PlayerPosition } from '@/types/player.ts'

export type PlayerFilters = {
  /** Matched against the player's names, ignoring case and accents. */
  search: string
  /** undefined for every position. */
  position?: PlayerPosition
  /** understat team_id; undefined for every team. */
  team?: number
}

/**
 * Lower-case text with accents stripped, so "martin" finds "Martín".
 * @param text - Text to normalize.
 * @returns The normalized text.
 */
export function normalizeName(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/**
 * Players matching every set filter.
 * @param players - All players; not modified.
 * @param filters - The filters to apply.
 * @returns The matching players, in their original order.
 */
export function filterPlayers(players: Player[], filters: PlayerFilters): Player[] {
  const search = normalizeName(filters.search)

  return players.filter(
    (player) =>
      (filters.position === undefined || player.element_type === filters.position) &&
      (filters.team === undefined || player.team === filters.team) &&
      (search === '' ||
        normalizeName(`${player.web_name} ${player.first_name} ${player.second_name}`).includes(
          search,
        )),
  )
}
