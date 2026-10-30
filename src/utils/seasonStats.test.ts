import { describe, expect, it } from 'vitest'

import type { EntryPicks, GameweekHistory, LivePlayerStats, Pick } from '@/types/myTeam'
import type { Player } from '@/types/player'

import { computeSeasonStats, type SeasonGameweek } from './seasonStats.ts'

function makeResult(event: number, overrides: Partial<GameweekHistory> = {}): GameweekHistory {
  return {
    event,
    points: 50,
    total_points: 50 * event,
    rank: 1_000_000,
    overall_rank: 1_000_000,
    bank: 0,
    value: 1000,
    event_transfers: 0,
    event_transfers_cost: 0,
    points_on_bench: 0,
    ...overrides,
  }
}

/** 15 picks, player id equals position; player 1 is captain unless overridden. */
function makePicks(overrides: Partial<Pick>[] = []): Pick[] {
  return Array.from({ length: 15 }, (_, i) => ({
    element: i + 1,
    position: i + 1,
    multiplier: i === 0 ? 2 : i < 11 ? 1 : 0,
    is_captain: i === 0,
    is_vice_captain: false,
    element_type: 3 as const,
    ...overrides[i],
  }))
}

function makeGameweek(
  event: number,
  points: Record<number, number>,
  overrides: Partial<EntryPicks> = {},
): SeasonGameweek {
  const live = new Map<number, LivePlayerStats>(
    Object.entries(points).map(([id, total_points]) => [Number(id), { minutes: 90, total_points }]),
  )
  return {
    entryPicks: {
      active_chip: null,
      automatic_subs: [],
      entry_history: makeResult(event),
      picks: makePicks(),
      ...overrides,
    },
    live,
  }
}

const players = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }) as Player)

describe('computeSeasonStats', () => {
  it('finds the best rank and score with their gameweeks', () => {
    const stats = computeSeasonStats(
      {
        current: [
          makeResult(1, { rank: 500_000, points: 60 }),
          makeResult(2, { rank: 100_000, points: 80 }),
          makeResult(3, { rank: null, points: 90 }),
        ],
        chips: [],
      },
      [],
      players,
    )

    expect(stats.bestRank?.event).toBe(2)
    expect(stats.bestScore?.event).toBe(3)
  })

  it('totals bench points, transfers, hits and value change', () => {
    const stats = computeSeasonStats(
      {
        current: [
          makeResult(1, { points_on_bench: 8, event_transfers: 2, event_transfers_cost: 4 }),
          makeResult(2, { points_on_bench: 5, event_transfers: 1, value: 1013, bank: 7 }),
        ],
        chips: [],
      },
      [],
      players,
    )

    expect(stats).toMatchObject({
      benchPoints: 13,
      transfers: 3,
      hitsCost: 4,
      teamValue: 1013,
      teamValueChange: 13,
      bank: 7,
    })
  })

  it('ranks players by points earned for the manager, captaincy included', () => {
    const stats = computeSeasonStats(
      { current: [makeResult(1)], chips: [] },
      [makeGameweek(1, { 1: 6, 2: 10, 3: 4, 12: 20 }), makeGameweek(2, { 1: 5, 2: 1 })],
      players,
    )

    expect(stats.topPlayers).toHaveLength(5)
    expect(stats.topPlayers.slice(0, 3).map(({ element, points }) => [element, points])).toEqual([
      [1, 22],
      [2, 11],
      [3, 4],
    ])
    expect(stats.captainPoints).toBe(22)
  })

  it('totals the bench players in the Bench Boost gameweek', () => {
    const stats = computeSeasonStats(
      { current: [makeResult(1)], chips: [] },
      [makeGameweek(1, { 12: 3, 13: 6, 14: 0, 15: 2 }, { active_chip: 'bboost' })],
      players,
    )

    expect(stats.benchBoost).toEqual({ gameweek: 1, points: 11 })
  })

  it('has no Bench Boost until it is played', () => {
    const stats = computeSeasonStats({ current: [], chips: [] }, [], players)

    expect(stats.benchBoost).toBeUndefined()
    expect(stats.bestRank).toBeUndefined()
  })
})
