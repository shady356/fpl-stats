const TEAM_BADGE_CODES: Record<string, number> = {
  Arsenal: 3,
  'Aston Villa': 7,
  Bournemouth: 91,
  Brentford: 94,
  Brighton: 36,
  Chelsea: 8,
  Coventry: 9,
  Palace: 31,
  Everton: 11,
  Fulham: 54,
  Hull: 88,
  'Ipswich Town': 40,
  Leeds: 2,
  Liverpool: 14,
  'Man City': 43,
  'Man Utd': 1,
  Newcastle: 4,
  'Nottm Forest': 17,
  Sunderland: 56,
  Spurs: 6,
}

export function teamBadgeUrl(teamName: string): string | null {
  const code = TEAM_BADGE_CODES[teamName]
  return code ? `https://resources.premierleague.com/premierleague25/badges-alt/${code}.svg` : null
}
