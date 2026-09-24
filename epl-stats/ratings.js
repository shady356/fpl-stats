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
  // Every team tied on this stat — treat as a neutral mid-score instead of dividing by zero.
  if (leagueMax === leagueMin) return 50

  let score

  score = ((teamValue - leagueMin) / (leagueMax - leagueMin)) * 100
  if (reverse) {
    score = ((leagueMax - teamValue) / (leagueMax - leagueMin)) * 100
  }

  return score
}

function calcAttack(goals, points, npxg, xP, deep) {
  const value = goals * 0.26 + points * 0.26 + npxg * 0.21 + xP * 0.11 + deep * 0.16
  return value
}

function calcDefense(ga, points, npxga, xP, deepAllowed) {
  const value = ga * 0.26 + points * 0.26 + npxga * 0.21 + xP * 0.11 + deepAllowed * 0.16
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
  league.npxgaMax = Math.max(...teams.map((t) => t.npxga))
  league.npxgaMin = Math.min(...teams.map((t) => t.npxga))
  league.deepAllowedMax = Math.max(...teams.map((t) => t.deep_allowed_per_game))
  league.deepAllowedMin = Math.min(...teams.map((t) => t.deep_allowed_per_game))
  return league
}

// points/attack/defense each blend actual + expected into one 1-5 rating.
export function calcTeamRating(team, league) {
  const scaledGoals = scale(league.gMax, league.gMin, team.goals)
  const scaledPoints = scale(league.ptsMax, league.ptsMin, team.points)
  const scalednpxg = scale(league.npxgMax, league.npxgMin, team.npxg)
  const scaledxP = scale(league.xPtsMax, league.xPtsMin, team.expected_points)
  const scaledDeep = scale(league.deepMax, league.deepMin, team.deep_per_game)
  const scaledGoalsA = scale(league.gAMax, league.gAMin, team.ga, true)
  const scalednpxga = scale(league.npxgaMax, league.npxgaMin, team.npxga, true)
  const scaledDeepAllowed = scale(
    league.deepAllowedMax,
    league.deepAllowedMin,
    team.deep_allowed_per_game,
    true,
  )

  const attack = calcAttack(scaledGoals, scaledPoints, scalednpxg, scaledxP, scaledDeep)
  const defense = calcDefense(scaledGoalsA, scaledPoints, scalednpxga, scaledxP, scaledDeepAllowed)

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

  // Re-normalize each sub-rating against its own min/max so the best/worst
  // team's rating actually spans the 1-5 scale.
  const attackMax = Math.max(...crudeRatings.map((r) => r.attack))
  const attackMin = Math.min(...crudeRatings.map((r) => r.attack))
  const defenseMax = Math.max(...crudeRatings.map((r) => r.defense))
  const defenseMin = Math.min(...crudeRatings.map((r) => r.defense))
  const totalMax = Math.max(...crudeRatings.map((r) => r.totalCrude))
  const totalMin = Math.min(...crudeRatings.map((r) => r.totalCrude))

  teams.forEach((team, index) => {
    const { attack, defense, totalCrude } = crudeRatings[index]

    const rating_total = round(scale(totalMax, totalMin, totalCrude), 2)
    const rating_attack = round(scale(attackMax, attackMin, attack), 2)
    const rating_defense = round(scale(defenseMax, defenseMin, defense), 2)

    team.rating_total = rating_total
    team.rating_attack = rating_attack
    team.rating_defense = rating_defense

    team.rating_total_color = RATING_COLORS[reviseTotalRating(rating_total)]
    team.rating_defense_color = RATING_COLORS[reviseTotalRating(rating_defense)]
    team.rating_attack_color = RATING_COLORS[reviseTotalRating(rating_attack)]
  })

  return teams
}
