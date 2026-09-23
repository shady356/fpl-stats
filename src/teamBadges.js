const TEAM_BADGE_CODES = {
  Arsenal: 3,
  'Aston Villa': 7,
  Bournemouth: 91,
  Brentford: 94,
  Brighton: 36,
  Chelsea: 8,
  Coventry: 9,
  'Crystal Pal': 31,
  Everton: 11,
  Fulham: 54,
  Hull: 88,
  Ipswich: 40,
  Leeds: 2,
  Liverpool: 14,
  'Man City': 43,
  'Man United': 1,
  Newcastle: 4,
  'Nott Forest': 17,
  Sunderland: 56,
  Tottenham: 6,
}

export function teamBadgeUrl(teamName) {
  const code = TEAM_BADGE_CODES[teamName]
  return code ? `https://resources.premierleague.com/premierleague25/badges-alt/${code}.svg` : null
}
