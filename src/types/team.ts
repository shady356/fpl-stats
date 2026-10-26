/**
 * One team's stats from a single match, as written to `epl-stats/data` by `fetch_stats.py`.
 */
export type MatchStats = {
  match_id: number
  /** Kickoff, `YYYY-MM-DD HH:mm:ss`; sorts chronologically as a string. */
  date: string
  opponent_id: number
  home: boolean
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
  deep: number
  deep_allowed: number
  /** null when the opponent made no defensive actions. */
  ppda: number | null
  /** null when the team made no defensive actions. */
  o_ppda: number | null
}

/**
 * A team and its matches, oldest first.
 */
export type TeamMatches = {
  team_id: number
  team_name: string
  matches: MatchStats[]
}

/**
 * One team's stats over a run of matches, built by aggregateMatches.
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
 * Fields computed by computeRatings. Ratings are 0-100, colors are CSS colors.
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
 * Fields computed by computePlayStyles.
 */
export type TeamPlayStyle = {
  pressing: string
  play_style: string
  play_style_detail: string
}

/**
 * One match in a team's recent form, built by computeForm.
 */
export type FormMatch = {
  match_id: number
  date: string
  result: 'W' | 'D' | 'L'
  home_team_id: number
  away_team_id: number
  home_team: string
  away_team: string
  home_goals: number
  away_goals: number
}

/**
 * Fields computed by computeForm.
 */
export type TeamForm = {
  /** Last 5 matches of the season, oldest first. */
  form: FormMatch[]
}

/**
 * Display assets for a team.
 */
export type TeamAssets = {
  team_name_short: string
}

/**
 * A team with stats, ratings, play style and assets, as built by computeTeamData.
 */
export type Team = TeamStats & TeamRatings & TeamPlayStyle & TeamForm & TeamAssets
