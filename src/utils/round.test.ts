import { describe, expect, it } from 'vitest'

import { round } from './round.ts'

describe('round', () => {
  it('rounds to 2 decimals by default', () => {
    expect(round(1.23456)).toBe(1.23)
    expect(round(2.675001)).toBe(2.68)
  })

  it('rounds to the given number of decimals', () => {
    expect(round(1.23456, 1)).toBe(1.2)
    expect(round(1.23456, 3)).toBe(1.235)
    expect(round(1.5, 0)).toBe(2)
  })

  it('leaves integers unchanged', () => {
    expect(round(7)).toBe(7)
  })
})
