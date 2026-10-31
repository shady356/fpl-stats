import { describe, expect, it } from 'vitest'

import type { Player } from '@/types/player.ts'

import { filterPlayers, normalizeName } from './playerFilters.ts'

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
    ...overrides,
  }
}

const ids = (players: Player[]) => players.map((player) => player.id)

describe('normalizeName', () => {
  it('strips accents and case', () => {
    expect(normalizeName(' Raya Martín ')).toBe('raya martin')
  })
})

describe('filterPlayers', () => {
  const players = [
    makePlayer(1, { web_name: 'Raya', second_name: 'Raya Martín', element_type: 1 }),
    makePlayer(2, { web_name: 'Salah', team: 87, element_type: 3 }),
    makePlayer(3, { web_name: 'Haaland', team: 88, element_type: 4 }),
  ]

  it('returns everyone without filters', () => {
    expect(ids(filterPlayers(players, { search: '' }))).toEqual([1, 2, 3])
  })

  it('searches every name, ignoring accents', () => {
    expect(ids(filterPlayers(players, { search: 'martin' }))).toEqual([1])
  })

  it('filters by position', () => {
    expect(ids(filterPlayers(players, { search: '', position: 4 }))).toEqual([3])
  })

  it('filters by team', () => {
    expect(ids(filterPlayers(players, { search: '', team: 87 }))).toEqual([2])
  })

  it('combines filters', () => {
    expect(ids(filterPlayers(players, { search: 'salah', team: 88 }))).toEqual([])
  })
})
