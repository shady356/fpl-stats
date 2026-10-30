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
  /** Premier League player code, used for the player's photo. */
  code: number
  web_name: string
  /** understat team_id (converted from the FPL team id). */
  team: number
  element_type: PlayerPosition
  /** Price in tenths of a million, e.g. 62 = £6.2m. */
  now_cost: number
  /** Price change since the start of the season, in tenths of a million, e.g. -3 = -£0.3m. */
  cost_change_start: number
  total_points: number
  minutes: number
  goals_scored: number
  assists: number
  /** Defensive contribution actions this season (tackles, interceptions, clearances, blocks, recoveries). */
  defensive_contribution: number
  form: string
  points_per_game: string
  expected_goal_involvements_per_90: number
  selected_by_percent: string
  /** Managers who brought the player in during the current gameweek. */
  transfers_in_event: number
  /** Managers who sold the player during the current gameweek. */
  transfers_out_event: number
  /** Price change this gameweek, in tenths of a million. */
  cost_change_event: number
  /** a = available, d = doubtful, i = injured, s = suspended, u = unavailable, n = not eligible. */
  status: string
}
