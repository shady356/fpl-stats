import { describe, expect, it } from 'vitest'

import { formColor } from './playerForm.ts'

describe('formColor', () => {
  it('is red below 3', () => {
    expect(formColor(0)).toBe('var(--forward-color)')
    expect(formColor(2.9)).toBe('var(--forward-color)')
  })

  it('is yellow from 3 to under 5', () => {
    expect(formColor(3)).toBe('var(--goalkeeper-color)')
    expect(formColor(4.9)).toBe('var(--goalkeeper-color)')
  })

  it('is green from 5', () => {
    expect(formColor(5)).toBe('var(--defender-color)')
    expect(formColor(9)).toBe('var(--defender-color)')
  })
})
