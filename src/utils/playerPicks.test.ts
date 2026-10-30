import { describe, expect, it } from 'vitest'

import type { TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Player } from '@/types/player.ts'

import {
  fixtureMultiplier,
  isDifferential,
  mostTransferred,
  projectPoints,
  rankPicks,
} from './playerPicks.ts'

/**
 * Build a Player with neutral defaults, overriding only what a test cares about.
 */
function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    code: 1,
    web_name: 'Player',
    team: 1,
    element_type: 3,
    now_cost: 60,
    cost_change_start: 0,
    cost_change_event: 0,
    total_points: 0,
    minutes: 900,
    goals_scored: 0,
    assists: 0,
    defensive_contribution: 0,
    form: '5.0',
    points_per_game: '5.0',
    expected_goal_involvements_per_90: 0,
    selected_by_percent: '10.0',
    transfers_in_event: 0,
    transfers_out_event: 0,
    status: 'a',
    ...overrides,
  }
}

function fixture(event: number, rating_total: number): TeamFixture {
  return {
    fixture_id: event,
    event,
    is_home: true,
    opponent: {
      team_name: 'Opponent',
      team_name_short: 'OPP',
      rating_total,
      rating_total_color: '',
      rating_attack_color: '',
      rating_defense_color: '',
    },
  }
}

function makeTeam(team_id: number, fixtures: TeamFixture[]): TeamWithFixtures {
  return { team_id, fixtures } as TeamWithFixtures
}

describe('mostTransferred', () => {
  const players = [
    makePlayer({ id: 1, transfers_in_event: 10, transfers_out_event: 300 }),
    makePlayer({ id: 2, transfers_in_event: 500, transfers_out_event: 0 }),
    makePlayer({ id: 3, transfers_in_event: 200, transfers_out_event: 100 }),
  ]

  it('ranks by transfers in', () => {
    expect(mostTransferred(players, 'in', 2).map((p) => p.id)).toEqual([2, 3])
  })

  it('ranks by transfers out and skips players nobody sold', () => {
    expect(mostTransferred(players, 'out', 5).map((p) => p.id)).toEqual([1, 3])
  })
})

describe('fixtureMultiplier', () => {
  it('is neutral against an average team', () => {
    expect(fixtureMultiplier(50)).toBe(1)
  })

  it('favours weaker opponents', () => {
    expect(fixtureMultiplier(0)).toBe(1.5)
    expect(fixtureMultiplier(100)).toBe(0.5)
  })
})

describe('projectPoints', () => {
  const player = makePlayer({ form: '5.0', points_per_game: '5.0' })

  it('sums points per game scaled by each opponent', () => {
    expect(projectPoints(player, [fixture(9, 50), fixture(10, 0)])).toBe(12.5)
  })

  it('is zero in a blank run', () => {
    expect(projectPoints(player, [])).toBe(0)
  })
})

describe('rankPicks', () => {
  const teams = [
    makeTeam(1, [fixture(9, 20), fixture(10, 20), fixture(11, 20), fixture(12, 20)]),
    makeTeam(2, [fixture(9, 80), fixture(10, 80), fixture(11, 80)]),
  ]

  it('ranks the easier run higher for equal players', () => {
    const players = [makePlayer({ id: 1, team: 2 }), makePlayer({ id: 2, team: 1 })]
    expect(rankPicks(players, teams, 9, 3).map((pick) => pick.player.id)).toEqual([2, 1])
  })

  it('only includes fixtures in the run', () => {
    const [pick] = rankPicks([makePlayer({ team: 1 })], teams, 9, 3)
    expect(pick.fixtures.map((f) => f.event)).toEqual([9, 10, 11])
  })

  it('skips unavailable and rarely played players', () => {
    const players = [
      makePlayer({ id: 1, status: 'i' }),
      makePlayer({ id: 2, minutes: 90 }),
      makePlayer({ id: 3 }),
    ]
    expect(rankPicks(players, teams, 9, 3).map((pick) => pick.player.id)).toEqual([3])
  })

  it('applies the extra filter', () => {
    const players = [
      makePlayer({ id: 1, selected_by_percent: '40.0' }),
      makePlayer({ id: 2, selected_by_percent: '2.1' }),
    ]
    expect(rankPicks(players, teams, 9, 3, isDifferential).map((pick) => pick.player.id)).toEqual([
      2,
    ])
  })
})
