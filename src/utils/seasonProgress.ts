import type { Gameweek } from '@/types/gameweek'
import type { EntryHistory } from '@/types/myTeam'

/**
 * Total points after one gameweek, per series.
 */
export type ProgressRow = {
  gameweek: number
  /** Total points by series key; missing when that manager has no result for the gameweek. */
  values: Record<string, number>
}

/** Series key for the accumulated gameweek average. */
export const AVERAGE_KEY = 'average'

/**
 * Each manager's total points after every gameweek, alongside the accumulated gameweek average.
 * @param histories - Each manager's season history, by series key.
 * @param gameweeks - bootstrap-static's gameweeks; only played ones (finished or current) are included.
 * @returns One row per played gameweek, oldest first.
 */
export function seasonProgress(
  histories: Record<string, EntryHistory>,
  gameweeks: Gameweek[],
): ProgressRow[] {
  let averageTotal = 0
  return gameweeks
    .filter((gameweek) => gameweek.finished || gameweek.is_current)
    .toSorted((a, b) => a.id - b.id)
    .map((gameweek) => {
      averageTotal += gameweek.average_entry_score ?? 0
      const values: Record<string, number> = { [AVERAGE_KEY]: averageTotal }
      for (const [key, history] of Object.entries(histories)) {
        const result = history.current.find((entry) => entry.event === gameweek.id)
        if (result) values[key] = result.total_points
      }
      return { gameweek: gameweek.id, values }
    })
}
