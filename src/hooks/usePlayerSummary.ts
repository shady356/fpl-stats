import { use } from 'react'

import { fetchPlayerSummary } from '@/services/FplAPI'
import type { PlayerSummary } from '@/types/player'

/** Cached per player so `use` gets the same promise across renders. */
const summaryPromises = new Map<number, Promise<PlayerSummary | undefined>>()

/**
 * A player's season so far. Suspends until loaded, so call it inside a Suspense boundary.
 * @param playerId - The player's id.
 * @returns The summary; undefined if the request fails.
 */
export function usePlayerSummary(playerId: number): PlayerSummary | undefined {
  let promise = summaryPromises.get(playerId)
  if (!promise) {
    promise = fetchPlayerSummary(playerId).then((summary) => {
      // Don't cache failed requests so the next render retries.
      if (!summary) summaryPromises.delete(playerId)
      return summary
    })
    summaryPromises.set(playerId, promise)
  }
  return use(promise)
}
