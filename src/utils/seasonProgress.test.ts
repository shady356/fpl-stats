import { describe, expect, it } from 'vitest'

import type { Gameweek } from '@/types/gameweek'
import type { EntryHistory, GameweekHistory } from '@/types/myTeam'

import { AVERAGE_KEY, seasonProgress } from './seasonProgress'

function gameweek(id: number, average: number, finished = true): Gameweek {
  return {
    id,
    finished,
    is_current: false,
    average_entry_score: average,
    highest_score: null,
    highest_scoring_entry: null,
  }
}

function history(totals: [event: number, total: number][]): EntryHistory {
  return {
    current: totals.map(([event, total_points]) => ({ event, total_points }) as GameweekHistory),
    chips: [],
  }
}

describe('seasonProgress', () => {
  it('accumulates the average and reads each total', () => {
    const rows = seasonProgress(
      {
        a: history([
          [1, 60],
          [2, 110],
        ]),
      },
      [gameweek(1, 50), gameweek(2, 40)],
    )

    expect(rows).toEqual([
      { gameweek: 1, values: { [AVERAGE_KEY]: 50, a: 60 } },
      { gameweek: 2, values: { [AVERAGE_KEY]: 90, a: 110 } },
    ])
  })

  it('skips unplayed gameweeks and leaves out missing results', () => {
    const rows = seasonProgress({ a: history([[2, 70]]) }, [
      gameweek(2, 40),
      gameweek(1, 50),
      gameweek(3, 0, false),
    ])

    expect(rows).toEqual([
      { gameweek: 1, values: { [AVERAGE_KEY]: 50 } },
      { gameweek: 2, values: { [AVERAGE_KEY]: 90, a: 70 } },
    ])
  })
})
