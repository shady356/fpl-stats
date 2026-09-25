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

// Attack and defense use only their own side's stats, weighting expected
// over actual since xG is the more stable signal.
function calcAttack(goals, npxg, deep, shots) {
  return goals * 0.3 + npxg * 0.4 + deep * 0.2 + shots * 0.1
}

function calcDefense(ga, npxga, deepAllowed, shotsAgainst) {
  return ga * 0.3 + npxga * 0.4 + deepAllowed * 0.2 + shotsAgainst * 0.1
}

// Results (points + xP) only feed the total, so they don't blur attack vs defense.
function calcTotal(attack, defense, points, xP) {
  return attack * 0.4 + defense * 0.4 + points * 0.1 + xP * 0.1
}

// Team stat keys that feed the rating; calcLeague records each one's league range.
const RATED_STATS = [
  'points',
  'expected_points',
  'goals',
  'npxg',
  'deep_per_game',
  'shots',
  'ga',
  'npxga',
  'deep_allowed_per_game',
  'shots_against',
]

// Returns { [statKey]: { min, max } } across all teams.
export function calcLeague(teams) {
  const league = {}
  RATED_STATS.forEach((key) => {
    const values = teams.map((t) => t[key])
    league[key] = { min: Math.min(...values), max: Math.max(...values) }
  })
  return league
}

// points/attack/defense each blend actual + expected into one 1-5 rating.
export function calcTeamRating(team, league) {
  const scaleStat = (key, reverse = false) =>
    scale(league[key].max, league[key].min, team[key], reverse)

  const scaledPoints = scaleStat('points')
  const scaledxP = scaleStat('expected_points')
  const scaledGoals = scaleStat('goals')
  const scalednpxg = scaleStat('npxg')
  const scaledDeep = scaleStat('deep_per_game')
  const scaledShots = scaleStat('shots')
  const scaledGoalsA = scaleStat('ga', true)
  const scalednpxga = scaleStat('npxga', true)
  const scaledDeepAllowed = scaleStat('deep_allowed_per_game', true)
  const scaledShotsAgainst = scaleStat('shots_against', true)

  const attack = calcAttack(scaledGoals, scalednpxg, scaledDeep, scaledShots)
  const defense = calcDefense(scaledGoalsA, scalednpxga, scaledDeepAllowed, scaledShotsAgainst)

  return {
    attack,
    defense,
    total: round(calcTotal(attack, defense, scaledPoints, scaledxP), 2),
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
  const rawRatings = teams.map((team) => calcTeamRating(team, league))

  // Re-normalize each sub-rating against its own min/max so the best/worst
  // team's rating actually spans the 1-5 scale.
  const attackMax = Math.max(...rawRatings.map((r) => r.attack))
  const attackMin = Math.min(...rawRatings.map((r) => r.attack))
  const defenseMax = Math.max(...rawRatings.map((r) => r.defense))
  const defenseMin = Math.min(...rawRatings.map((r) => r.defense))
  const totalMax = Math.max(...rawRatings.map((r) => r.total))
  const totalMin = Math.min(...rawRatings.map((r) => r.total))

  teams.forEach((team, index) => {
    const { attack, defense, total } = rawRatings[index]

    const rating_attack = round(scale(attackMax, attackMin, attack), 2)
    const rating_defense = round(scale(defenseMax, defenseMin, defense), 2)
    const rating_total = round(scale(totalMax, totalMin, total), 2)

    team.rating_attack = rating_attack
    team.rating_defense = rating_defense
    team.rating_total = rating_total

    team.rating_attack_color = RATING_COLORS[reviseTotalRating(rating_attack)]
    team.rating_defense_color = RATING_COLORS[reviseTotalRating(rating_defense)]
    team.rating_total_color = RATING_COLORS[reviseTotalRating(rating_total)]
  })

  return teams
}
