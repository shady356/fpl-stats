import { describe, expect, it } from 'vitest'

import { formColor } from './playerForm.ts'

describe('formColor', () => {
  it('is gray at 0', () => {
    expect(formColor(0)).toBe('var(--text-secondary-color)')
  })

  it('is red above 0 and below 3', () => {
    expect(formColor(0.1)).toBe('var(--forward-color)')
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
