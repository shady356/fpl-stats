import { useSyncExternalStore } from 'react'

import { parseFavoriteIds, toggleFavoriteId } from '@/utils/favoritePlayers'

const STORAGE_KEY = 'favorite-players'

/** Components in this tab to re-render when the favourites change. */
const listeners = new Set<() => void>()

/** Parsed once per stored value, so the snapshot stays the same array between renders. */
let cachedRaw: string | null = null
let cachedIds: number[] = []

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function getSnapshot(): number[] {
  const raw = readStorage()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedIds = parseFavoriteIds(raw)
  }
  return cachedIds
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  // Other tabs saving favourites fire a storage event here.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function toggleFavorite(playerId: number) {
  const ids = toggleFavoriteId(getSnapshot(), playerId)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage is blocked or full; keep the change for this session at least.
    cachedRaw = JSON.stringify(ids)
    cachedIds = ids
  }
  listeners.forEach((listener) => listener())
}

/**
 * The player ids on the wish list, saved in localStorage and shared across components and tabs.
 * @returns The ids in the order they were added, and a function to add or remove one.
 */
export function useFavoritePlayers(): {
  favoriteIds: number[]
  toggleFavorite: (playerId: number) => void
} {
  const favoriteIds = useSyncExternalStore(subscribe, getSnapshot)
  return { favoriteIds, toggleFavorite }
}
