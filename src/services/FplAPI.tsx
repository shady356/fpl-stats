import type { Fixture } from '@/types/fixture'
import type { Player } from '@/types/player'
import { understatTeamId } from '@/utils/teamIds'

export type FixturesQuery = {
  future?: boolean
  team?: number
}

/**
 * Fetch fixtures, with team_h / team_a converted to understat team ids.
 * @param query - Query params sent to the FPL fixtures endpoint.
 * @returns The fixtures; empty if the request fails.
 */
export async function fetchFixtures({ future = true, team }: FixturesQuery = {}): Promise<
  Fixture[]
> {
  const params = new URLSearchParams()
  if (future) params.set('future', '1')
  if (team !== undefined) params.set('team', String(team))

  try {
    const response = await fetch(`/fpl-api/fixtures/?${params}`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data: Fixture[] = await response.json()

    return data.flatMap((fixture) => {
      const team_h = understatTeamId(fixture.team_h)
      const team_a = understatTeamId(fixture.team_a)

      if (team_h === undefined || team_a === undefined) {
        console.warn(`Skipping fixture ${fixture.id}: unmapped FPL team id`)
        return []
      }

      return [{ ...fixture, team_h, team_a }]
    })
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return []
  }
}

/**
 * Fetch all players from bootstrap-static, with team converted to understat team ids.
 * @returns The players; empty if the request fails.
 */
export async function fetchPlayers(): Promise<Player[]> {
  try {
    const response = await fetch('/fpl-api/bootstrap-static/')

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data: { elements: Player[] } = await response.json()

    return data.elements.flatMap((player) => {
      const team = understatTeamId(player.team)

      if (team === undefined) {
        console.warn(`Skipping player ${player.id}: unmapped FPL team id`)
        return []
      }

      return [{ ...player, team }]
    })
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return []
  }
}

/**
 * Fetch the current gameweek from the Premier League config.
 * @returns The current gameweek number; undefined if the request fails.
 */
export async function fetchCurrentGameweek(): Promise<number | undefined> {
  try {
    const response = await fetch('/pl-resources/premierleague25/config/current-gameweek.json')

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data: { matchweek: number } = await response.json()

    return data.matchweek
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return undefined
  }
}
