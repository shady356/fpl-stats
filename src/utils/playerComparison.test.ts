import { describe, expect, it } from 'vitest'

import type { Player } from '@/types/player.ts'

import {
  bestPlayerIds,
  COMPARISON_STATS,
  comparisonPath,
  comparisonStats,
  parseComparedIds,
} from './playerComparison.ts'

function makePlayer(id: number, overrides: Partial<Player> = {}): Player {
  return {
    id,
    code: id,
    first_name: 'First',
    second_name: 'Second',
    web_name: 'Player',
    team: 83,
    element_type: 3,
    now_cost: 60,
    cost_change_start: 0,
    cost_change_event: 0,
    total_points: 0,
    minutes: 0,
    goals_scored: 0,
    assists: 0,
    clean_sheets: 0,
    goals_conceded: 0,
    saves: 0,
    bonus: 0,
    starts: 0,
    yellow_cards: 0,
    red_cards: 0,
    expected_goals: '0.00',
    expected_assists: '0.00',
    defensive_contribution: 0,
    form: '0.0',
    points_per_game: '0.0',
    expected_goal_involvements_per_90: 0,
    selected_by_percent: '0.0',
    transfers_in_event: 0,
    transfers_out_event: 0,
    status: 'a',
    news: '',
    news_added: null,
    chance_of_playing_next_round: null,
    ...overrides,
  }
}

const stat = (key: string) => COMPARISON_STATS.find((stat) => stat.key === key)!
const keys = (stats: { key: string }[]) => stats.map((stat) => stat.key)

describe('comparisonStats', () => {
  it('shows saves for goalkeepers instead of defensive contributions', () => {
    expect(keys(comparisonStats(1))).toContain('saves')
    expect(keys(comparisonStats(1))).not.toContain('defensive_contribution')
  })

  it('shows defensive contributions for outfield players instead of saves', () => {
    expect(keys(comparisonStats(3))).toContain('defensive_contribution')
    expect(keys(comparisonStats(3))).not.toContain('saves')
  })
})

describe('bestPlayerIds', () => {
  it('picks the higher value', () => {
    const a = makePlayer(1, { goals_scored: 3 })
    const b = makePlayer(2, { goals_scored: 5 })
    expect(bestPlayerIds(stat('goals_scored'), [a, b])).toEqual([2])
  })

  it('compares decimal strings as numbers', () => {
    const a = makePlayer(1, { expected_goals: '10.20' })
    const b = makePlayer(2, { expected_goals: '9.80' })
    expect(bestPlayerIds(stat('expected_goals'), [a, b])).toEqual([1])
  })

  it('picks everyone sharing the best value among three', () => {
    const players = [
      makePlayer(1, { assists: 4 }),
      makePlayer(2, { assists: 2 }),
      makePlayer(3, { assists: 4 }),
    ]
    expect(bestPlayerIds(stat('assists'), players)).toEqual([1, 3])
  })

  it('picks no one when they all tie', () => {
    expect(bestPlayerIds(stat('assists'), [makePlayer(1), makePlayer(2)])).toEqual([])
  })

  it('picks no one for a single player', () => {
    expect(bestPlayerIds(stat('assists'), [makePlayer(1, { assists: 2 })])).toEqual([])
  })

  it('picks no one for stats that are not compared', () => {
    const a = makePlayer(1, { yellow_cards: 4, selected_by_percent: '30.1', now_cost: 120 })
    const b = makePlayer(2)
    expect(bestPlayerIds(stat('yellow_cards'), [a, b])).toEqual([])
    expect(bestPlayerIds(stat('selected_by_percent'), [a, b])).toEqual([])
    expect(bestPlayerIds(stat('now_cost'), [a, b])).toEqual([])
  })
})

describe('transfer stats', () => {
  it('shortens large numbers', () => {
    const player = makePlayer(1, { transfers_in_event: 1216009, transfers_out_event: 13136 })
    expect(stat('transfers_in_event').format!(player)).toBe('1.2M')
    expect(stat('transfers_out_event').format!(player)).toBe('13.1K')
  })
})

describe('parseComparedIds', () => {
  it('reads ids in order', () => {
    expect(parseComparedIds('124,68')).toEqual([124, 68])
  })

  it('handles a missing param', () => {
    expect(parseComparedIds(null)).toEqual([])
  })

  it('skips junk and duplicates and keeps at most three', () => {
    expect(parseComparedIds('5,x,,5,7,-1,8,9')).toEqual([5, 7, 8])
  })
})

describe('comparisonPath', () => {
  it('puts the ids in the URL', () => {
    expect(comparisonPath([124, 68])).toBe('/compare?ids=124,68')
    expect(comparisonPath([])).toBe('/compare')
  })
})
