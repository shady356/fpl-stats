import { describe, expect, it } from 'vitest'

import type { EntryPicks, LivePlayerStats, Pick } from '@/types/myTeam'
import type { Player, PlayerPosition } from '@/types/player'

import { buildLineup } from './lineup.ts'

/** A 4-4-2 with the bench in positions 12-15; player id equals position. */
const POSITIONS: PlayerPosition[] = [1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 1, 2, 3, 4]

function makePick(position: number, overrides: Partial<Pick> = {}): Pick {
  return {
    element: position,
    position,
    multiplier: position <= 11 ? 1 : 0,
    is_captain: false,
    is_vice_captain: false,
    element_type: POSITIONS[position - 1],
    ...overrides,
  }
}

function makeEntryPicks(overrides: Partial<EntryPicks> = {}): EntryPicks {
  return {
    active_chip: null,
    automatic_subs: [],
    entry_history: {
      event: 1,
      points: 0,
      total_points: 0,
      rank: null,
      overall_rank: null,
      bank: 0,
      value: 1000,
      event_transfers: 0,
      event_transfers_cost: 0,
      points_on_bench: 0,
    },
    picks: POSITIONS.map((_, i) => makePick(i + 1)),
    ...overrides,
  }
}

const players = POSITIONS.map((element_type, i) => ({ id: i + 1, element_type }) as Player)
const live = new Map<number, LivePlayerStats>(
  POSITIONS.map((_, i) => [i + 1, { minutes: 90, total_points: 2 }]),
)

describe('buildLineup', () => {
  it('splits the starting XI into formation rows and keeps the bench in sub order', () => {
    const lineup = buildLineup(makeEntryPicks(), players, live)

    expect(lineup.rows.map((row) => row.length)).toEqual([1, 4, 4, 2])
    expect(lineup.bench.map(({ pick }) => pick.position)).toEqual([12, 13, 14, 15])
  })

  it('applies the captain multiplier but shows bench points unmultiplied', () => {
    const picks = POSITIONS.map((_, i) => makePick(i + 1))
    picks[9] = makePick(10, { multiplier: 2, is_captain: true })
    const lineup = buildLineup(makeEntryPicks({ picks }), players, live)

    expect(lineup.rows[3][0].points).toBe(4)
    expect(lineup.bench[0].points).toBe(2)
  })

  it('flags automatic subs', () => {
    const lineup = buildLineup(
      makeEntryPicks({ automatic_subs: [{ element_in: 9, element_out: 14 }] }),
      players,
      live,
    )

    expect(lineup.rows[2][3].subbedIn).toBe(true)
    expect(lineup.bench[2].subbedOut).toBe(true)
  })

  it('treats players missing from the live data as not having played', () => {
    const lineup = buildLineup(makeEntryPicks(), players, new Map())

    expect(lineup.rows[0][0]).toMatchObject({ minutes: 0, points: 0 })
  })
})
