import { describe, expect, it } from 'vitest'

import type { MatchStats, TeamMatches } from '@/types/team.ts'

import { aggregateMatches } from './aggregateMatches.ts'

/**
 * Build a MatchStats object with neutral defaults, overriding only what a test cares about.
 */
function makeMatch(overrides: Partial<MatchStats> = {}): MatchStats {
  return {
    match_id: 1,
    date: '2026-08-01 15:00:00',
    opponent_id: 99,
    home: true,
    points: 1,
    expected_points: 1,
    goals: 1,
    xg: 1,
    npxg: 1,
    ga: 1,
    xga: 1,
    npxga: 1,
    shots: 10,
    shots_on_target: 4,
    shots_against: 10,
    shots_on_target_against: 4,
    deep: 6,
    deep_allowed: 6,
    ppda: 10,
    o_ppda: 10,
    ...overrides,
  }
}

function makeTeam(team_id: number, matches: Partial<MatchStats>[]): TeamMatches {
  return { team_id, team_name: `Team ${team_id}`, matches: matches.map(makeMatch) }
}

describe('aggregateMatches', () => {
  // Oldest first: a win, then two losses.
  const team = makeTeam(1, [
    { points: 3, goals: 3, shots: 20, deep: 12 },
    { points: 0, goals: 0, shots: 5, deep: 2 },
    { points: 0, goals: 1, shots: 8, deep: 4 },
  ])

  it('sums every match when the window is all', () => {
    const [stats] = aggregateMatches([team])
    expect(stats.games_played).toBe(3)
    expect(stats.points).toBe(3)
    expect(stats.goals).toBe(4)
    expect(stats.shots).toBe(33)
    expect(stats.deep_per_game).toBe(6)
  })

  it('keeps only the most recent matches', () => {
    const fourMatches = makeTeam(1, [{ points: 3, goals: 5 }, ...team.matches])
    const [stats] = aggregateMatches([fourMatches], 3)
    expect(stats.games_played).toBe(3)
    expect(stats.goals).toBe(4)
  })

  it('uses every match when a team has played fewer than the window', () => {
    const [stats] = aggregateMatches([team], 5)
    expect(stats.games_played).toBe(3)
    expect(stats.points).toBe(3)
  })

  it('ranks positions over the selected window', () => {
    // The leader is ahead on the season (9 points to 7) but behind over the last 3 matches (3 to 7).
    const leader = makeTeam(1, [
      { points: 3 },
      { points: 3 },
      { points: 3 },
      { points: 0 },
      { points: 0 },
    ])
    const inForm = makeTeam(2, [
      { points: 0 },
      { points: 0 },
      { points: 1 },
      { points: 3 },
      { points: 3 },
    ])

    const season = aggregateMatches([inForm, leader])
    expect(season.map((t) => [t.team_id, t.points, t.position])).toEqual([
      [1, 9, 1],
      [2, 7, 2],
    ])

    const lastThree = aggregateMatches([inForm, leader], 3)
    expect(lastThree.map((t) => [t.team_id, t.points, t.position])).toEqual([
      [2, 7, 1],
      [1, 3, 2],
    ])
  })

  it('counts a match without a PPDA as 0', () => {
    const [stats] = aggregateMatches([makeTeam(1, [{ ppda: 12 }, { ppda: null }])])
    expect(stats.ppda_per_game).toBe(6)
  })

  it('returns zeroed per-game stats for a team with no matches', () => {
    const [stats] = aggregateMatches([makeTeam(1, [])])
    expect(stats.games_played).toBe(0)
    expect(stats.deep_per_game).toBe(0)
  })
})
