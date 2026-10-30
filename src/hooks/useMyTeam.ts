import { use } from 'react'

import {
  fetchEntry,
  fetchEntryHistory,
  fetchEntryPicks,
  fetchLiveGameweek,
} from '@/services/FplAPI'
import type { Entry, EntryHistory, EntryPicks, LivePlayerStats } from '@/types/myTeam'
import type { SeasonGameweek } from '@/utils/seasonStats'

/** Cached per team / gameweek so `use` gets the same promise across renders. */
const entryPromises = new Map<number, Promise<Entry | undefined>>()
const picksPromises = new Map<string, Promise<EntryPicks | undefined>>()
const livePromises = new Map<number, Promise<Map<number, LivePlayerStats>>>()
const historyPromises = new Map<number, Promise<EntryHistory | undefined>>()
const seasonPromises = new Map<string, Promise<SeasonGameweek[]>>()

/**
 * Cache a promise under a key, dropping it if it resolves to a failure so the next render retries.
 */
function cached<K, T>(
  cache: Map<K, Promise<T>>,
  key: K,
  load: () => Promise<T>,
  failed: (value: T) => boolean,
): Promise<T> {
  let promise = cache.get(key)
  if (!promise) {
    promise = load().then((value) => {
      if (failed(value)) cache.delete(key)
      return value
    })
    cache.set(key, promise)
  }
  return promise
}

/**
 * A manager's FPL team. Suspends until loaded, so call it inside a Suspense boundary.
 * @param teamId - The manager's team id.
 * @returns The team; undefined if the request fails.
 */
export function useEntry(teamId: number): Entry | undefined {
  return use(
    cached(
      entryPromises,
      teamId,
      () => fetchEntry(teamId),
      (entry) => !entry,
    ),
  )
}

/**
 * A manager's picks for a gameweek. Suspends until loaded, so call it inside a Suspense boundary.
 * @param teamId - The manager's team id.
 * @param gameweek - The gameweek.
 * @returns The picks; undefined if the request fails.
 */
export function useEntryPicks(teamId: number, gameweek: number): EntryPicks | undefined {
  return use(
    cached(
      picksPromises,
      `${teamId}-${gameweek}`,
      () => fetchEntryPicks(teamId, gameweek),
      (picks) => !picks,
    ),
  )
}

/**
 * Every player's stats for a gameweek. Suspends until loaded, so call it inside a Suspense boundary.
 * @param gameweek - The gameweek.
 * @returns Stats by player id; empty if the request fails.
 */
export function useLiveGameweek(gameweek: number): Map<number, LivePlayerStats> {
  return use(
    cached(
      livePromises,
      gameweek,
      () => fetchLiveGameweek(gameweek),
      (live) => live.size === 0,
    ),
  )
}

/**
 * A manager's season results and chips. Suspends until loaded, so call it inside a Suspense boundary.
 * @param teamId - The manager's team id.
 * @returns The history; undefined if the request fails.
 */
export function useEntryHistory(teamId: number): EntryHistory | undefined {
  return use(
    cached(
      historyPromises,
      teamId,
      () => fetchEntryHistory(teamId),
      (history) => !history,
    ),
  )
}

/**
 * Picks and live stats for each of the given gameweeks, sharing the per-gameweek caches.
 * Suspends until all are loaded, so call it inside a Suspense boundary.
 * @param teamId - The manager's team id.
 * @param gameweeks - The gameweeks to load.
 * @returns One entry per gameweek that loaded; gameweeks whose picks failed are left out.
 */
export function useSeasonGameweeks(teamId: number, gameweeks: number[]): SeasonGameweek[] {
  return use(
    cached(
      seasonPromises,
      `${teamId}-${gameweeks.join(',')}`,
      async () => {
        const loaded = await Promise.all(
          gameweeks.map(async (gameweek) => {
            const [entryPicks, live] = await Promise.all([
              cached(
                picksPromises,
                `${teamId}-${gameweek}`,
                () => fetchEntryPicks(teamId, gameweek),
                (picks) => !picks,
              ),
              cached(
                livePromises,
                gameweek,
                () => fetchLiveGameweek(gameweek),
                (live) => live.size === 0,
              ),
            ])
            return entryPicks ? [{ entryPicks, live }] : []
          }),
        )
        return loaded.flat()
      },
      (season) => season.length < gameweeks.length,
    ),
  )
}
