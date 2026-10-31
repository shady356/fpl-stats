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
  first_name: string
  second_name: string
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
  clean_sheets: number
  goals_conceded: number
  saves: number
  bonus: number
  starts: number
  yellow_cards: number
  red_cards: number
  /** Decimal string, e.g. "4.31". */
  expected_goals: string
  /** Decimal string, e.g. "1.20". */
  expected_assists: string
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
  /** FPL's injury or suspension note, e.g. "Hamstring injury - 75% chance of playing"; empty when there is none. */
  news: string
  /** When `news` was last updated, ISO 8601; null if never. */
  news_added: string | null
  /** 0, 25, 50, 75 or 100; null when the player isn't flagged. */
  chance_of_playing_next_round: number | null
}

/**
 * One match a player was involved in, from element-summary's `history` array.
 * Double gameweeks have two entries with the same `round`.
 */
export type PlayerMatch = {
  fixture: number
  /** understat team_id (converted from the FPL team id). */
  opponent_team: number
  was_home: boolean
  kickoff_time: string
  team_h_score: number | null
  team_a_score: number | null
  /** Gameweek. */
  round: number
  total_points: number
  minutes: number
  goals_scored: number
  assists: number
  clean_sheets: number
  bonus: number
  /** Decimal string, e.g. "0.42". */
  expected_goals: string
  /** Decimal string, e.g. "0.10". */
  expected_assists: string
  defensive_contribution: number
  yellow_cards: number
  red_cards: number
  /** Price at the time of the match, in tenths of a million. */
  value: number
  /** Managers who owned the player at the time of the match. */
  selected: number
}

/**
 * A player's season so far, from the `element-summary/{id}/` endpoint.
 */
export type PlayerSummary = {
  /** Matches played this season, oldest first. */
  history: PlayerMatch[]
}
