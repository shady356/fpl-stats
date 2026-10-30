/**
 * A gameweek from bootstrap-static's `events` array.
 */
export type Gameweek = {
  id: number
  finished: boolean
  is_current: boolean
  /** null until the gameweek has scores. */
  average_entry_score: number | null
  highest_score: number | null
  /** Team id of the manager with the highest score. */
  highest_scoring_entry: number | null
}
