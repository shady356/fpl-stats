import { describe, expect, it } from 'vitest'

import { playerStatus } from './playerStatus.ts'

describe('playerStatus', () => {
  it('is null when available', () => {
    expect(playerStatus('a')).toBeNull()
  })

  it('is yellow when doubtful', () => {
    expect(playerStatus('d')).toEqual({
      label: 'Doubtful',
      icon: 'warning',
      color: 'var(--goalkeeper-color)',
    })
  })

  it('is red when the player is out', () => {
    expect(playerStatus('i')).toEqual({
      label: 'Injured',
      icon: 'medical_services',
      color: 'var(--forward-color)',
    })
    expect(playerStatus('s')?.color).toBe('var(--forward-color)')
    expect(playerStatus('u')?.color).toBe('var(--forward-color)')
    expect(playerStatus('n')?.color).toBe('var(--forward-color)')
  })
})
