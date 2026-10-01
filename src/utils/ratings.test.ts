import { describe, expect, it } from 'vitest'

import type { TeamStats } from '@/types/team.ts'

import { calcLeague, computeRatings, RATING_COLORS, reviseTotalRating, scale } from './ratings.ts'

/**
 * Build a TeamStats object with neutral defaults, overriding only what a test cares about.
 */
function makeTeam(overrides: Partial<TeamStats> = {}): TeamStats {
  return {
    team_id: 1,
    team_name: 'Test FC',
    position: 1,
    games_played: 10,
    points: 15,
    expected_points: 15,
    goals: 15,
    xg: 15,
    npxg: 15,
    ga: 15,
    xga: 15,
    npxga: 15,
    shots: 120,
    shots_on_target: 40,
    shots_against: 120,
    shots_on_target_against: 40,
    deep_per_game: 6,
    deep_allowed_per_game: 6,
    ppda_per_game: 10,
    o_ppda_per_game: 10,
    ...overrides,
  }
}

describe('scale', () => {
  it('maps the league min to 0 and max to 100', () => {
    expect(scale(20, 10, 10)).toBe(0)
    expect(scale(20, 10, 20)).toBe(100)
    expect(scale(20, 10, 15)).toBe(50)
  })

  it('flips the scale when reverse is true', () => {
    expect(scale(20, 10, 10, true)).toBe(100)
    expect(scale(20, 10, 20, true)).toBe(0)
  })

  it('returns 50 when every team is tied', () => {
    expect(scale(10, 10, 10)).toBe(50)
  })
})

describe('reviseTotalRating', () => {
  it.each([
    [0, 1],
    [12.4, 1],
    [12.5, 2],
    [50, 3],
    [62.5, 4],
    [100, 5],
  ])('rating %d -> bucket %d', (rating, bucket) => {
    expect(reviseTotalRating(rating)).toBe(bucket)
  })
})

describe('calcLeague', () => {
  it('records the min and max of each rated stat', () => {
    const league = calcLeague([makeTeam({ goals: 5 }), makeTeam({ goals: 30 })])
    expect(league.goals).toEqual({ min: 5, max: 30 })
  })
})

describe('computeRatings', () => {
  const strong = makeTeam({ team_id: 1, points: 30, goals: 25, npxg: 24, ga: 5, npxga: 6 })
  const average = makeTeam({ team_id: 2 })
  const weak = makeTeam({ team_id: 3, points: 3, goals: 5, npxg: 6, ga: 25, npxga: 24 })

  it('keeps the input order', () => {
    expect(computeRatings([strong, average, weak])).toHaveLength(3)
  })

  it('gives the best team 100 and the worst team 0', () => {
    const [s, , w] = computeRatings([strong, average, weak])
    expect(s.rating_total).toBe(100)
    expect(w.rating_total).toBe(0)
  })

  it('assigns colors from the matching bucket', () => {
    const [s, , w] = computeRatings([strong, average, weak])
    expect(s.rating_total_color).toBe(RATING_COLORS[5])
    expect(w.rating_total_color).toBe(RATING_COLORS[1])
  })
})
