// Ports the 1-5 team rating system from an earlier Vue project.
// Each team gets three sub-ratings (points, attack, defense), blending
// actual + expected stats, plus a total rating re-normalized across teams.

export function round(value, decimals = 0) {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

// Rescale `score` from [scoreMin, scoreMax] onto a 1-5 scale.
// `reverse` flips the scale for stats where lower is better (e.g. goals against).
export function scale(leagueMax, leagueMin, teamValue, reverse = false) {
  let score

  score = ((teamValue - leagueMin) / (leagueMax - leagueMin)) * 100
  if (reverse) {
    score = ((leagueMax - teamValue) / (leagueMax - leagueMin)) * 100
  }

  return score
}

function calcAttack(goals, points, npxg, xP, deep, ppda) {
  const value = goals * 0.25 + points * 0.25 + npxg * 0.2 + xP * 0.1 + deep * 0.15 + ppda * 0.05
  return value
}

function calcDefense(ga, points, npxga, xP, deepAllowed, oppda) {
  const value =
    ga * 0.25 + points * 0.25 + npxga * 0.2 + xP * 0.1 + deepAllowed * 0.15 + oppda * 0.05
  return value
}

export function calcLeague(teams) {
  const league = {}
  league.ptsMax = Math.max(...teams.map((t) => t.points))
  league.ptsMin = Math.min(...teams.map((t) => t.points))
  league.xPtsMax = Math.max(...teams.map((t) => t.expected_points))
  league.xPtsMin = Math.min(...teams.map((t) => t.expected_points))
  league.gMax = Math.max(...teams.map((t) => t.goals))
  league.gMin = Math.min(...teams.map((t) => t.goals))
  league.npxgMax = Math.max(...teams.map((t) => t.npxg))
  league.npxgMin = Math.min(...teams.map((t) => t.npxg))
  league.gAMax = Math.max(...teams.map((t) => t.ga))
  league.gAMin = Math.min(...teams.map((t) => t.ga))
  league.deepMax = Math.max(...teams.map((t) => t.deep_per_game))
  league.deepMin = Math.min(...teams.map((t) => t.deep_per_game))
  league.ppdaMax = Math.max(...teams.map((t) => t.ppda_per_game))
  league.ppdaMin = Math.min(...teams.map((t) => t.ppda_per_game))
  league.npxgaMax = Math.max(...teams.map((t) => t.npxga))
  league.npxgaMin = Math.min(...teams.map((t) => t.npxga))
  league.deepAllowedMax = Math.max(...teams.map((t) => t.deep_allowed_per_game))
  league.deepAllowedMin = Math.min(...teams.map((t) => t.deep_allowed_per_game))
  league.oppdaMax = Math.max(...teams.map((t) => t.o_ppda_per_game))
  league.oppdaMin = Math.min(...teams.map((t) => t.o_ppda_per_game))
  return league
}

// points/attack/defense each blend actual + expected into one 1-5 rating.
export function calcTeamRating(team, league) {
  const scaledGoals = scale(league.gMax, league.gMin, team.goals)
  const scaledPoints = scale(league.ptsMax, league.ptsMin, team.points)
  const scalednpxg = scale(league.npxgMax, league.npxgMin, team.npxg)
  const scaledxP = scale(league.xPtsMax, league.xPtsMin, team.expected_points)
  const scaledDeep = scale(league.deepMax, league.deepMin, team.deep_per_game)
  const scaledPpda = scale(league.ppdaMax, league.ppdaMin, team.ppda_per_game, true)
  const scaledGoalsA = scale(league.gAMax, league.gAMin, team.ga, true)
  const scalednpxga = scale(league.npxgaMax, league.npxgaMin, team.npxga, true)
  const scaledDeepAllowed = scale(
    league.deepAllowedMax,
    league.deepAllowedMin,
    team.deep_allowed_per_game,
    true,
  )
  const scaledoppda = scale(league.oppdaMax, league.oppdaMin, team.o_ppda_per_game)

  const attack = calcAttack(scaledGoals, scaledPoints, scalednpxg, scaledxP, scaledDeep, scaledPpda)
  const defense = calcDefense(
    scaledGoalsA,
    scaledPoints,
    scalednpxga,
    scaledxP,
    scaledDeepAllowed,
    scaledoppda,
  )

  return {
    attack,
    defense,
    totalCrude: round((attack + defense) / 2, 2),
  }
}

// Custom rounding for the final integer rating: floor unless the
// decimal part is >= 0.5, in which case round up.
export function reviseTotalRating(rating) {
  const score = rating / 25 + 1
  const decimal = score - Math.floor(score)
  return decimal >= 0.5 ? Math.floor(score + 1) : Math.floor(score)
}

// Color scale from green (best, rating 1) to red (worst, rating 5).
export const RATING_COLORS = {
  1: 'rgb(0, 78, 47)',
  2: 'rgb(0, 150, 73)',
  3: 'rgb(108, 108, 108)',
  4: 'rgb(233, 44, 91)',
  5: 'rgb(128, 7, 45)',
}

// Mutates and returns `teams`, adding flat rating_* fields to each team.
export function computeRatings(teams) {
  const league = calcLeague(teams)
  const crudeRatings = teams.map((team) => calcTeamRating(team, league))

  // Re-normalize totalCrude against its own min/max so the best/worst
  // team's total rating actually spans the 1-5 scale.
  const totalMax = Math.max(...crudeRatings.map((r) => r.totalCrude))
  const totalMin = Math.min(...crudeRatings.map((r) => r.totalCrude))

  teams.forEach((team, index) => {
    const { attack, defense, totalCrude } = crudeRatings[index]
    const total = round(scale(totalMax, totalMin, totalCrude), 2)
    const totalScaleOneToFive = reviseTotalRating(total)

    team.rating_attack = attack
    team.rating_defense = defense
    team.rating_total = total
    team.rating_color = RATING_COLORS[totalScaleOneToFive]
  })

  return teams
}
