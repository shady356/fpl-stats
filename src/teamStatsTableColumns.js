export const RATING_COLUMN_KEYS = ['rating_total', 'rating_defense', 'rating_attack']

export const COLUMNS = [
  { key: 'team_name', label: 'Team', to_fixed: 0, hidden: false, align: 'left' },
  { key: 'rating_total', label: 'Rating', to_fixed: 2, hidden: false, align: 'left' },
  { key: 'games_played', label: 'Played', hidden: false, align: 'right' },
  { key: 'rating_points', label: 'Points', to_fixed: 2, hidden: true, align: 'right' },
  { key: 'points', label: 'Points', hidden: false, align: 'right' },
  { key: 'expected_points', label: 'xPts', to_fixed: 2, hidden: false, align: 'right' },
  { key: 'rating_attack', label: 'Attack', to_fixed: 2, hidden: false, align: 'left' },
  { key: 'goals', label: 'G', hidden: false, align: 'right' },
  { key: 'xg', label: 'xG', to_fixed: 2, hidden: false, align: 'right' },
  { key: 'rating_defense', label: 'Defense', to_fixed: 2, hidden: false, align: 'left' },
  { key: 'ga', label: 'GA', hidden: false, align: 'right' },
  { key: 'xga', label: 'xGA', to_fixed: 2, hidden: false, align: 'right' },
  { key: 'shots', label: 'Shots', hidden: false, align: 'right' },
  { key: 'shots_on_target', label: 'SOT', hidden: false, align: 'right' },
  { key: 'shots_against', label: 'SA', hidden: false, align: 'right' },
  {
    key: 'shots_on_target_against',
    label: 'SOTA',
    hidden: false,
    align: 'right',
  },
  { key: 'aggregated_deep', label: 'Total Deep', hidden: true, align: 'right' },
  { key: 'deep_per_game', label: 'Deep', to_fixed: 1, hidden: false, align: 'right' },
  { key: 'aggregated_ppda', label: 'Total PPDA', to_fixed: 2, hidden: true, align: 'right' },
  { key: 'ppda_per_game', label: 'PPDA', to_fixed: 2, hidden: false, align: 'right' },
]
