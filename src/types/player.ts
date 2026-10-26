/**
 * FPL position, the `element_type` field in bootstrap-static.
 * 1 = goalkeeper, 2 = defender, 3 = midfielder, 4 = forward.
 */
export type PlayerPosition = 1 | 2 | 3 | 4

/**
 * A player from bootstrap-static's `elements` array.
 */
export type Player = {
  id: number
  web_name: string
  /** understat team_id (converted from the FPL team id). */
  team: number
  element_type: PlayerPosition
  /** Price in tenths of a million, e.g. 62 = £6.2m. */
  now_cost: number
  total_points: number
  form: string
  selected_by_percent: string
  /** a = available, d = doubtful, i = injured, s = suspended, u = unavailable, n = not eligible. */
  status: string
}
