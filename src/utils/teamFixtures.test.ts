import { describe, expect, it } from 'vitest'

import type { TeamFixture } from '@/types/fixture.ts'

import { fixtureDifficulty } from './teamFixtures.ts'

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

describe('fixtureDifficulty', () => {
  const fixtures = [fixture(9, 20), fixture(10, 40), fixture(11, 90), fixture(12, 10)]

  it('averages opponent ratings over the run', () => {
    expect(fixtureDifficulty(fixtures, 9, 3)).toBe(50)
    expect(fixtureDifficulty(fixtures, 9, 5)).toBe(40)
  })

  it('ignores fixtures outside the run', () => {
    expect(fixtureDifficulty(fixtures, 10, 1)).toBe(40)
  })

  it('counts each fixture in a double gameweek', () => {
    expect(fixtureDifficulty([...fixtures, fixture(9, 80)], 9, 1)).toBe(50)
  })

  it('returns undefined when the team has no fixtures in the run', () => {
    expect(fixtureDifficulty(fixtures, 20, 3)).toBeUndefined()
  })
})
