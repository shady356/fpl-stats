/**
 * One team's season stats, as written to `epl-stats/data` by `fetch_stats.py`.
 */
export type TeamStats = {
  team_id: number
  team_name: string
  position: number
  games_played: number
  points: number
  expected_points: number
  goals: number
  xg: number
  npxg: number
  ga: number
  xga: number
  npxga: number
  shots: number
  shots_on_target: number
  shots_against: number
  shots_on_target_against: number
  deep_per_game: number
  deep_allowed_per_game: number
  ppda_per_game: number
  o_ppda_per_game: number
}

/**
 * Fields added by computeRatings. Ratings are 0-100, colors are CSS colors.
 */
export type TeamRatings = {
  rating_attack: number
  rating_defense: number
  rating_total: number
  rating_attack_color: string
  rating_defense_color: string
  rating_total_color: string
}

/**
 * Fields added by computePlayStyles.
 */
export type TeamPlayStyle = {
  pressing: string
  play_style: string
  play_style_detail: string
}

/**
 * A team with stats, ratings and play style, as shown in the Overview table.
 */
export type Team = TeamStats & TeamRatings & TeamPlayStyle
