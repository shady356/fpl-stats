import { useBootstrap } from '@/hooks/useBootstrap'
import type { Player } from '@/types/player'

/**
 * All players from bootstrap-static, fetched once and cached for the session.
 * Suspends until loaded, so call it inside a Suspense boundary.
 * @returns The players; empty if the request fails.
 */
export function usePlayers(): Player[] {
  return useBootstrap()?.players ?? []
}
