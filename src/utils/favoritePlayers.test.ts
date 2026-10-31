import { describe, expect, it } from 'vitest'

import { parseFavoriteIds, toggleFavoriteId } from './favoritePlayers.ts'

describe('parseFavoriteIds', () => {
  it('reads stored ids in order', () => {
    expect(parseFavoriteIds('[3, 1, 2]')).toEqual([3, 1, 2])
  })

  it('returns nothing when nothing is stored', () => {
    expect(parseFavoriteIds(null)).toEqual([])
    expect(parseFavoriteIds('')).toEqual([])
  })

  it('ignores invalid JSON and non-arrays', () => {
    expect(parseFavoriteIds('not json')).toEqual([])
    expect(parseFavoriteIds('{"id": 1}')).toEqual([])
  })

  it('drops invalid ids and duplicates', () => {
    expect(parseFavoriteIds('[1, "2", 0, -3, 1.5, null, 4, 1]')).toEqual([1, 4])
  })
})

describe('toggleFavoriteId', () => {
  it('adds a missing id at the end', () => {
    expect(toggleFavoriteId([1, 2], 3)).toEqual([1, 2, 3])
  })

  it('removes an existing id', () => {
    expect(toggleFavoriteId([1, 2, 3], 2)).toEqual([1, 3])
  })
})
