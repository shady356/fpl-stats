/**
 * FPL team id (as used in fixtures' team_h / team_a) → understat team_id.
 * FPL ids are the `id` field in bootstrap-static's `teams` array. They are
 * alphabetical and reassigned every season, so update this with promotions and relegations.
 */

const FPL_TO_UNDERSTAT_TEAM_ID: Record<number, number> = {
  1: 83, // Arsenal
  2: 71, // Aston Villa
  3: 73, // Bournemouth
  4: 244, // Brentford
  5: 220, // Brighton
  6: 80, // Chelsea
  7: 294, // Coventry
  8: 78, // Palace
  9: 72, // Everton
  10: 228, // Fulham
  11: 91, // Hull
  12: 285, // Ipswich Town
  13: 245, // Leeds
  14: 87, // Liverpool
  15: 88, // Man City
  16: 89, // Man Utd
  17: 86, // Newcastle
  18: 249, // Nottm Forest
  19: 82, // Spurs
  20: 77, // Sunderland
}

/**
 * Convert an FPL team id to the understat team_id used in epl-stats/data.
 * @param fplId - FPL team id.
 * @returns The understat team_id, or undefined if the team isn't mapped.
 */
export function understatTeamId(fplId: number): number | undefined {
  return FPL_TO_UNDERSTAT_TEAM_ID[fplId]
}
