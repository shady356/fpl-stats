import { use } from 'react'

import { fetchBootstrap, type Bootstrap } from '@/services/FplAPI'

/** Shared across renders and pages, so bootstrap-static is only downloaded once. */
let bootstrapPromise: Promise<Bootstrap | undefined> | undefined

export function getBootstrap(): Promise<Bootstrap | undefined> {
  bootstrapPromise ??= fetchBootstrap().then((bootstrap) => {
    // Don't cache failed requests so the next render retries.
    if (!bootstrap) bootstrapPromise = undefined
    return bootstrap
  })
  return bootstrapPromise
}

/**
 * bootstrap-static, fetched once and cached for the session.
 * Suspends until loaded, so call it inside a Suspense boundary.
 * @returns The bootstrap data; undefined if the request fails.
 */
export function useBootstrap(): Bootstrap | undefined {
  return use(getBootstrap())
}
