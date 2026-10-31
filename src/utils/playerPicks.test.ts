import { describe, expect, it } from 'vitest'

import type { TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Player } from '@/types/player.ts'

import {
  dueAReturn,
  fixtureMultiplier,
  flaggedPlayers,
  isDifferential,
  mostTransferred,
  priceChanges,
  projectPoints,
  rankDefensiveContributors,
  rankPicks,
} from './playerPicks.ts'

/**
 * Build a Player with neutral defaults, overriding only what a test cares about.
 */
function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    code: 1,
    first_name: 'First',
    second_name: 'Second',
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
    clean_sheets: 0,
    goals_conceded: 0,
    saves: 0,
    bonus: 0,
    starts: 10,
    yellow_cards: 0,
    red_cards: 0,
    expected_goals: '0.00',
    expected_assists: '0.00',
    defensive_contribution: 0,
    form: '5.0',
    points_per_game: '5.0',
    expected_goal_involvements_per_90: 0,
    selected_by_percent: '10.0',
    transfers_in_event: 0,
    transfers_out_event: 0,
    status: 'a',
    news: '',
    news_added: null,
    chance_of_playing_next_round: null,
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

describe('priceChanges', () => {
  const players = [
    makePlayer({ id: 1, cost_change_event: 1, selected_by_percent: '5.0' }),
    makePlayer({ id: 2, cost_change_event: -1 }),
    makePlayer({ id: 3, cost_change_event: 1, selected_by_percent: '30.0' }),
    makePlayer({ id: 4, cost_change_event: 0 }),
  ]

  it('lists risers, most owned first on a tie', () => {
    expect(priceChanges(players, 'rise', 5).map((p) => p.id)).toEqual([3, 1])
  })

  it('lists fallers', () => {
    expect(priceChanges(players, 'fall', 5).map((p) => p.id)).toEqual([2])
  })
})

describe('flaggedPlayers', () => {
  it('lists doubtful, injured and suspended players, most owned first', () => {
    const players = [
      makePlayer({ id: 1, status: 'd', selected_by_percent: '3.0' }),
      makePlayer({ id: 2, status: 'a' }),
      makePlayer({ id: 3, status: 'i', selected_by_percent: '40.0' }),
      makePlayer({ id: 4, status: 'u', selected_by_percent: '60.0' }),
      makePlayer({ id: 5, status: 's', selected_by_percent: '10.0' }),
    ]
    expect(flaggedPlayers(players, 5).map((p) => p.id)).toEqual([3, 5, 1])
  })
})

describe('rankDefensiveContributors', () => {
  it('ranks against each position threshold and skips goalkeepers', () => {
    const players = [
      // 11 per 90 for a midfielder is under the 12 threshold
      makePlayer({ id: 1, element_type: 3, minutes: 900, defensive_contribution: 110 }),
      // 10 per 90 for a defender meets the 10 threshold
      makePlayer({ id: 2, element_type: 2, minutes: 900, defensive_contribution: 100 }),
      makePlayer({ id: 3, element_type: 1, minutes: 900, defensive_contribution: 200 }),
    ]
    const ranked = rankDefensiveContributors(players)
    expect(ranked.map((c) => c.player.id)).toEqual([2, 1])
    expect(ranked[0]).toMatchObject({ per90: 10, threshold: 10 })
  })

  it('skips rarely played players', () => {
    const players = [makePlayer({ element_type: 2, minutes: 90, defensive_contribution: 20 })]
    expect(rankDefensiveContributors(players)).toEqual([])
  })
})

describe('dueAReturn', () => {
  it('ranks by xGI shortfall and skips overperformers', () => {
    const players = [
      makePlayer({ id: 1, expected_goals: '3.00', expected_assists: '1.00', goals_scored: 2 }),
      makePlayer({ id: 2, expected_goals: '6.00', expected_assists: '0.00', goals_scored: 1 }),
      makePlayer({ id: 3, expected_goals: '1.00', expected_assists: '0.00', goals_scored: 4 }),
    ]
    const due = dueAReturn(players, 5)
    expect(due.map((d) => d.player.id)).toEqual([2, 1])
    expect(due[0]).toMatchObject({ xgi: 6, gi: 1 })
  })
})
