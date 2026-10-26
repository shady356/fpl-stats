const TEAM_FULL_NAMES: Record<string, string> = {
  Arsenal: 'Arsenal',
  'Aston Villa': 'Aston Villa',
  Bournemouth: 'AFC Bournemouth',
  Brentford: 'Brentford',
  Brighton: 'Brighton & Hove Albion',
  Chelsea: 'Chelsea',
  Coventry: 'Coventry City',
  Palace: 'Crystal Palace',
  Everton: 'Everton',
  Fulham: 'Fulham',
  Hull: 'Hull City',
  'Ipswich Town': 'Ipswich Town',
  Leeds: 'Leeds United',
  Liverpool: 'Liverpool',
  'Man City': 'Manchester City',
  'Man Utd': 'Manchester United',
  Newcastle: 'Newcastle United',
  'Nottm Forest': 'Nottingham Forest',
  Sunderland: 'Sunderland',
  Spurs: 'Tottenham Hotspur',
}

/**
 * Full name for a team.
 * @param teamName - Team name as it appears in epl-stats/data.
 * @returns The full name, or the given name when it isn't known.
 */
export function teamFullName(teamName: string): string {
  return TEAM_FULL_NAMES[teamName] ?? teamName
}
