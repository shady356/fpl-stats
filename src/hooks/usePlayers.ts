import { use } from 'react'

import { fetchPlayers } from '@/services/FplAPI'
import type { Player } from '@/types/player'

/** Shared across renders and pages, so bootstrap-static is only downloaded once. */
let playersPromise: Promise<Player[]> | undefined

function getPlayers(): Promise<Player[]> {
  playersPromise ??= fetchPlayers().then((players) => {
    // Failed requests resolve to []; don't cache them so the next render retries.
    if (players.length === 0) playersPromise = undefined
    return players
  })
  return playersPromise
}

/**
 * All players from bootstrap-static, fetched once and cached for the session.
 * Suspends until loaded, so call it inside a Suspense boundary.
 * @returns The players; empty if the request fails.
 */
export function usePlayers(): Player[] {
  return use(getPlayers())
}
