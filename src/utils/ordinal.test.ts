import { describe, expect, it } from 'vitest'

import { ordinal } from './ordinal.ts'

describe('ordinal', () => {
  it('uses st, nd and rd for 1, 2 and 3', () => {
    expect(ordinal(1)).toBe('1st')
    expect(ordinal(2)).toBe('2nd')
    expect(ordinal(3)).toBe('3rd')
  })

  it('uses th from 4 onwards', () => {
    expect(ordinal(4)).toBe('4th')
    expect(ordinal(10)).toBe('10th')
  })

  it('uses th for 11, 12 and 13', () => {
    expect(ordinal(11)).toBe('11th')
    expect(ordinal(12)).toBe('12th')
    expect(ordinal(13)).toBe('13th')
  })

  it('uses st, nd and rd again from 21', () => {
    expect(ordinal(21)).toBe('21st')
    expect(ordinal(22)).toBe('22nd')
    expect(ordinal(23)).toBe('23rd')
  })
})
