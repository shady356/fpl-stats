import { describe, expect, it } from 'vitest'

import type { PlayerMatch } from '@/types/player'

import { matchResult, playerGameweeks } from './playerHistory.ts'

function makeMatch(round: number, overrides: Partial<PlayerMatch> = {}): PlayerMatch {
  return {
    fixture: round,
    opponent_team: 83,
    was_home: true,
    kickoff_time: `2026-08-${String(round + 10).padStart(2, '0')}T14:00:00Z`,
    team_h_score: 1,
    team_a_score: 0,
    round,
    total_points: 2,
    minutes: 90,
    goals_scored: 0,
    assists: 0,
    clean_sheets: 0,
    bonus: 0,
    expected_goals: '0.00',
    expected_assists: '0.00',
    defensive_contribution: 0,
    yellow_cards: 0,
    red_cards: 0,
    value: 60,
    selected: 1000,
    ...overrides,
  }
}

describe('playerGameweeks', () => {
  it('returns one entry per gameweek, oldest first', () => {
    const gameweeks = playerGameweeks([makeMatch(2), makeMatch(1)])

    expect(gameweeks.map((gameweek) => gameweek.gameweek)).toEqual([1, 2])
  })

  it('sums points and minutes across a double gameweek', () => {
    const [gameweek] = playerGameweeks([
      makeMatch(3, { total_points: 6, minutes: 90 }),
      makeMatch(3, { total_points: 1, minutes: 20, kickoff_time: '2026-08-20T19:00:00Z' }),
    ])

    expect(gameweek.points).toBe(7)
    expect(gameweek.minutes).toBe(110)
    expect(gameweek.matches).toHaveLength(2)
  })

  it("uses the price from the gameweek's last match", () => {
    const [gameweek] = playerGameweeks([
      makeMatch(3, { value: 61, kickoff_time: '2026-08-20T19:00:00Z' }),
      makeMatch(3, { value: 60, kickoff_time: '2026-08-16T14:00:00Z' }),
    ])

    expect(gameweek.price).toBe(61)
  })
})

describe('matchResult', () => {
  it('shows the score from the home side', () => {
    expect(matchResult(makeMatch(1, { team_h_score: 2, team_a_score: 1 }))).toBe('W 2-1')
  })

  it('shows the score from the away side', () => {
    expect(matchResult(makeMatch(1, { was_home: false, team_h_score: 2, team_a_score: 1 }))).toBe(
      'L 1-2',
    )
  })

  it('shows draws', () => {
    expect(matchResult(makeMatch(1, { team_h_score: 0, team_a_score: 0 }))).toBe('D 0-0')
  })

  it('is undefined before the match finishes', () => {
    expect(matchResult(makeMatch(1, { team_h_score: null, team_a_score: null }))).toBeUndefined()
  })
})
