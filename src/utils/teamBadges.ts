/**
 * understat team_id → Premier League badge code.
 */
const TEAM_BADGE_CODES: Record<number, number> = {
  83: 3, // Arsenal
  71: 7, // Aston Villa
  73: 91, // Bournemouth
  244: 94, // Brentford
  220: 36, // Brighton
  80: 8, // Chelsea
  294: 9, // Coventry
  78: 31, // Palace
  72: 11, // Everton
  228: 54, // Fulham
  91: 88, // Hull
  285: 40, // Ipswich Town
  245: 2, // Leeds
  87: 14, // Liverpool
  88: 43, // Man City
  89: 1, // Man Utd
  86: 4, // Newcastle
  249: 17, // Nottm Forest
  77: 56, // Sunderland
  82: 6, // Spurs
}

/**
 * Get the badge image URL for a team.
 * @param teamId - understat team_id.
 * @returns The badge URL, or null if the team isn't mapped.
 */
export function teamBadgeUrl(teamId: number): string | null {
  const code = TEAM_BADGE_CODES[teamId]
  return code ? `https://resources.premierleague.com/premierleague25/badges-alt/${code}.svg` : null
}
