/**
 * Team stat keys that feed the rating; calcLeague records each one's league range.
 */
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

/* --- CALC RATINGS --- */
/**
 * Attack rating from the team's own attacking stats only, weighting expected
 * over actual since xG is the more stable signal.
 * @param {number} goals - Scaled goals scored (0-100).
 * @param {number} npxg - Scaled non-penalty xG (0-100).
 * @param {number} deep - Scaled deep completions per game (0-100).
 * @param {number} shots - Scaled shots (0-100).
 * @returns {number} Raw attack rating (0-100).
 */
function calcAttack(goals, npxg, deep, shots) {
  return goals * 0.3 + npxg * 0.4 + deep * 0.2 + shots * 0.1
}

/**
 * Defense rating from the team's own defensive stats only, mirroring calcAttack.
 * All inputs are reverse-scaled, so higher means fewer conceded.
 * @param {number} ga - Scaled goals against (0-100).
 * @param {number} npxga - Scaled non-penalty xGA (0-100).
 * @param {number} deepAllowed - Scaled deep completions allowed per game (0-100).
 * @param {number} shotsAgainst - Scaled shots against (0-100).
 * @returns {number} Raw defense rating (0-100).
 */
function calcDefense(ga, npxga, deepAllowed, shotsAgainst) {
  return ga * 0.3 + npxga * 0.4 + deepAllowed * 0.2 + shotsAgainst * 0.1
}

/**
 * Overall rating. Results (points + xP) only feed the total, so they don't
 * blur attack vs defense.
 * @param {number} attack - Raw attack rating.
 * @param {number} defense - Raw defense rating.
 * @param {number} points - Scaled points (0-100).
 * @param {number} xP - Scaled expected points (0-100).
 * @returns {number} Raw total rating (0-100).
 */
function calcTotal(attack, defense, points, xP) {
  return attack * 0.4 + defense * 0.4 + points * 0.1 + xP * 0.1
}

/* --- HELPER FUNCTIONS --- */

/**
 * Rescale `teamValue` from [leagueMin, leagueMax] onto 0-100.
 * @param {number} leagueMax - Highest value in the league.
 * @param {number} leagueMin - Lowest value in the league.
 * @param {number} teamValue - The team's value.
 * @param {boolean} [reverse=false] - Flip the scale for stats where lower is better (e.g. goals against).
 * @returns {number} Score from 0 (worst) to 100 (best); 50 if every team is tied.
 */
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

/**
 * Map a 0-100 rating onto an integer 1-5 bucket: floor unless the decimal
 * part is >= 0.5, in which case round up.
 * @param {number} rating - Rating from 0 to 100.
 * @returns {number} Integer from 1 to 5, used as a RATING_COLORS key.
 */
export function reviseTotalRating(rating) {
  const score = rating / 25 + 1
  const decimal = score - Math.floor(score)
  return decimal >= 0.5 ? Math.floor(score + 1) : Math.floor(score)
}

/**
 * League-wide range of every stat in RATED_STATS.
 * @param {object[]} teams - Team stat objects.
 * @returns {Object<string, {min: number, max: number}>} Range per stat key.
 */
export function calcLeague(teams) {
  const league = {}
  RATED_STATS.forEach((key) => {
    const values = teams.map((t) => t[key])
    league[key] = { min: Math.min(...values), max: Math.max(...values) }
  })
  return league
}

/**
 * Raw attack, defense and total ratings for one team, before re-normalizing
 * across the league.
 * @param {object} team - Team stat object.
 * @param {Object<string, {min: number, max: number}>} league - Output of calcLeague.
 * @returns {{attack: number, defense: number, total: number}} Raw ratings.
 */
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
    total: calcTotal(attack, defense, scaledPoints, scaledxP),
  }
}

/* --- VISUALS --- */

/**
 * Color per 1-5 bucket from reviseTotalRating, green (1 - easy to beat) to red (5 - hard to beat).
 */
export const RATING_COLORS = {
  1: 'rgb(0, 78, 47)',
  2: 'rgb(0, 150, 73)',
  3: 'rgb(108, 108, 108)',
  4: 'rgb(233, 44, 91)',
  5: 'rgb(128, 7, 45)',
}

/**
 * Add rating_attack/defense/total (0-100) and matching *_color fields to each team.
 * @param {object[]} teams - Team stat objects; mutated in place.
 * @returns {object[]} The same `teams` array.
 */
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

    const rating_attack = scale(attackMax, attackMin, attack)
    const rating_defense = scale(defenseMax, defenseMin, defense)
    const rating_total = scale(totalMax, totalMin, total)

    team.rating_attack = rating_attack
    team.rating_defense = rating_defense
    team.rating_total = rating_total

    team.rating_attack_color = RATING_COLORS[reviseTotalRating(rating_attack)]
    team.rating_defense_color = RATING_COLORS[reviseTotalRating(rating_defense)]
    team.rating_total_color = RATING_COLORS[reviseTotalRating(rating_total)]
  })

  return teams
}
