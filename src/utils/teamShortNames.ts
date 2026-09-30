const TEAM_SHORT_NAMES: Record<string, string> = {
  Arsenal: 'ARS',
  'Aston Villa': 'AVL',
  Bournemouth: 'BOU',
  Brentford: 'BRE',
  Brighton: 'BHA',
  Chelsea: 'CHE',
  Coventry: 'COV',
  Palace: 'CRY',
  Everton: 'EVE',
  Fulham: 'FUL',
  Hull: 'HUL',
  'Ipswich Town': 'IPS',
  Leeds: 'LEE',
  Liverpool: 'LIV',
  'Man City': 'MCI',
  'Man Utd': 'MUN',
  Newcastle: 'NEW',
  'Nottm Forest': 'NFO',
  Sunderland: 'SUN',
  Spurs: 'TOT',
}

/**
 * Three-letter short name for a team, as used by FPL.
 * @param teamName - Team name as it appears in epl-stats/data.
 * @returns The short name.
 */
export function teamShortName(teamName: string): string {
  return TEAM_SHORT_NAMES[teamName]
}
