import type { TeamRatings, TeamStats } from '@/types/team.ts'

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
] as const satisfies readonly (keyof TeamStats)[]

/* 
  Without as const, TypeScript sees your array as a generic list of strings (string[]).
  With as const, it locks the values down to those exact literal words ('points', 'goals', etc.).
  
  But as const does not care what those words mean. You could type 'banana' or 'spaceship' into that array,
  and as const will happily lock them in.
  This is where satisfies steps in. It doesn't actually change the type of the array at all.
  Instead, it asks TypeScript: "Hey, look at these specific strings I just locked down. 
  Are they all valid keys inside TeamStats?" */

type RatedStat = (typeof RATED_STATS)[number]

/**
 * League-wide min/max for each rated stat.
 */
export type League = Record<RatedStat, { min: number; max: number }>

/**
 * A team's attack, defense and total ratings before re-normalizing across the league.
 */
type RawRating = {
  attack: number
  defense: number
  total: number
}

/* --- CALC RATINGS --- */
/**
 * Attack rating from the team's own attacking stats only, weighting expected
 * over actual since xG is the more stable signal.
 * @param goals - Scaled goals scored (0-100).
 * @param npxg - Scaled non-penalty xG (0-100).
 * @param deep - Scaled deep completions per game (0-100).
 * @param shots - Scaled shots (0-100).
 * @returns Raw attack rating (0-100).
 */
function calcAttack(goals: number, npxg: number, deep: number, shots: number): number {
  return goals * 0.3 + npxg * 0.4 + deep * 0.2 + shots * 0.1
}

/**
 * Defense rating from the team's own defensive stats only, mirroring calcAttack.
 * All inputs are reverse-scaled, so higher means fewer conceded.
 * @param ga - Scaled goals against (0-100).
 * @param npxga - Scaled non-penalty xGA (0-100).
 * @param deepAllowed - Scaled deep completions allowed per game (0-100).
 * @param shotsAgainst - Scaled shots against (0-100).
 * @returns Raw defense rating (0-100).
 */
function calcDefense(ga: number, npxga: number, deepAllowed: number, shotsAgainst: number): number {
  return ga * 0.3 + npxga * 0.4 + deepAllowed * 0.2 + shotsAgainst * 0.1
}

/**
 * Overall rating. Results (points + xP) only feed the total, so they don't
 * blur attack vs defense.
 * @param attack - Raw attack rating.
 * @param defense - Raw defense rating.
 * @param points - Scaled points (0-100).
 * @param xP - Scaled expected points (0-100).
 * @returns Raw total rating (0-100).
 */
function calcTotal(attack: number, defense: number, points: number, xP: number): number {
  return attack * 0.4 + defense * 0.4 + points * 0.1 + xP * 0.1
}

/* --- HELPER FUNCTIONS --- */

/**
 * Rescale `teamValue` from [leagueMin, leagueMax] onto 0-100.
 * @param leagueMax - Highest value in the league.
 * @param leagueMin - Lowest value in the league.
 * @param teamValue - The team's value.
 * @param reverse - Flip the scale for stats where lower is better (e.g. goals against).
 * @returns Score from 0 (worst) to 100 (best); 50 if every team is tied.
 */
export function scale(
  leagueMax: number,
  leagueMin: number,
  teamValue: number,
  reverse = false,
): number {
  // Every team tied on this stat — treat as a neutral mid-score instead of dividing by zero.
  if (leagueMax === leagueMin) return 50

  let score = ((teamValue - leagueMin) / (leagueMax - leagueMin)) * 100
  if (reverse) {
    score = ((leagueMax - teamValue) / (leagueMax - leagueMin)) * 100
  }

  return score
}

/**
 * Map a 0-100 rating onto an integer 1-5 bucket: floor unless the decimal
 * part is >= 0.5, in which case round up.
 * @param rating - Rating from 0 to 100.
 * @returns Integer from 1 to 5, used as a RATING_COLORS key.
 */
export function reviseTotalRating(rating: number): number {
  const score = rating / 25 + 1
  const decimal = score - Math.floor(score)
  return decimal >= 0.5 ? Math.floor(score + 1) : Math.floor(score)
}

/**
 * League-wide range of every stat in RATED_STATS.
 * @param teams - Team stat objects.
 * @returns Range per stat key.
 */
export function calcLeague(teams: TeamStats[]): League {
  const entries = RATED_STATS.map((key) => {
    const values = teams.map((t) => t[key])
    return [key, { min: Math.min(...values), max: Math.max(...values) }]
  })
  return Object.fromEntries(entries) as League
}

/**
 * Raw attack, defense and total ratings for one team, before re-normalizing
 * across the league.
 * @param team - Team stat object.
 * @param league - Output of calcLeague.
 * @returns Raw ratings.
 */
export function calcTeamRating(team: TeamStats, league: League): RawRating {
  const scaleStat = (key: RatedStat, reverse = false) =>
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
  const total = calcTotal(attack, defense, scaledPoints, scaledxP)

  return {
    attack,
    defense,
    total,
  }
}

/* --- VISUALS --- */

/**
 * Color per 1-5 bucket from reviseTotalRating, green (1 - easy to beat) to red (5 - hard to beat).
 */
export const RATING_COLORS: Record<number, string> = {
  1: 'rgb(0, 78, 47)',
  2: 'rgb(0, 150, 73)',
  3: 'rgb(108, 108, 108)',
  4: 'rgb(233, 44, 91)',
  5: 'rgb(128, 7, 45)',
}

/**
 * Add rating_attack/defense/total (0-100) and matching *_color fields to each team.
 * @param teams - Team stat objects; not modified.
 * @returns New team objects with the rating fields added.
 */
export function computeRatings(teams: TeamStats[]): (TeamStats & TeamRatings)[] {
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

  return teams.map((team, index) => {
    const { attack, defense, total } = rawRatings[index]

    const rating_attack = scale(attackMax, attackMin, attack)
    const rating_defense = scale(defenseMax, defenseMin, defense)
    const rating_total = scale(totalMax, totalMin, total)

    return {
      ...team,
      rating_attack,
      rating_defense,
      rating_total,
      rating_attack_color: RATING_COLORS[reviseTotalRating(rating_attack)],
      rating_defense_color: RATING_COLORS[reviseTotalRating(rating_defense)],
      rating_total_color: RATING_COLORS[reviseTotalRating(rating_total)],
    }
  })
}
