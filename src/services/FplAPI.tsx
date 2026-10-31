import type { Fixture } from '@/types/fixture'
import type { Gameweek } from '@/types/gameweek'
import type { Entry, EntryHistory, EntryPicks, LivePlayerStats } from '@/types/myTeam'
import type { Player, PlayerMatch, PlayerSummary } from '@/types/player'
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

export type Bootstrap = {
  /** Players with team converted to understat team ids. */
  players: Player[]
  gameweeks: Gameweek[]
  /** Number of FPL managers this season. */
  total_players: number
}

/**
 * Fetch bootstrap-static: all players and gameweeks.
 * @returns The bootstrap data; undefined if the request fails.
 */
export async function fetchBootstrap(): Promise<Bootstrap | undefined> {
  try {
    const response = await fetch('/fpl-api/bootstrap-static/')

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data: { elements: Player[]; events: Gameweek[]; total_players: number } =
      await response.json()

    const players = data.elements.flatMap((player) => {
      const team = understatTeamId(player.team)

      if (team === undefined) {
        console.warn(`Skipping player ${player.id}: unmapped FPL team id`)
        return []
      }

      return [{ ...player, team }]
    })

    return { players, gameweeks: data.events, total_players: data.total_players }
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return undefined
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

/**
 * Fetch an FPL manager's team.
 * @param teamId - The manager's team id, as in the FPL app's points page URL.
 * @returns The team; undefined if the request fails.
 */
export async function fetchEntry(teamId: number): Promise<Entry | undefined> {
  try {
    const response = await fetch(`/fpl-api/entry/${teamId}/`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return undefined
  }
}

/**
 * Fetch a manager's picks for a gameweek, with automatic subs already applied.
 * @param teamId - The manager's team id.
 * @param gameweek - The gameweek.
 * @returns The picks; undefined if the request fails.
 */
export async function fetchEntryPicks(
  teamId: number,
  gameweek: number,
): Promise<EntryPicks | undefined> {
  try {
    const response = await fetch(`/fpl-api/entry/${teamId}/event/${gameweek}/picks/`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return undefined
  }
}

/**
 * Fetch every player's stats for a gameweek.
 * @param gameweek - The gameweek.
 * @returns Stats by player id; empty if the request fails.
 */
export async function fetchLiveGameweek(gameweek: number): Promise<Map<number, LivePlayerStats>> {
  try {
    const response = await fetch(`/fpl-api/event/${gameweek}/live/`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data: { elements: { id: number; stats: LivePlayerStats }[] } = await response.json()

    return new Map(data.elements.map((element) => [element.id, element.stats]))
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return new Map()
  }
}

/**
 * Fetch a manager's season so far: each gameweek's result and the chips played.
 * @param teamId - The manager's team id.
 * @returns The history; undefined if the request fails.
 */
export async function fetchEntryHistory(teamId: number): Promise<EntryHistory | undefined> {
  try {
    const response = await fetch(`/fpl-api/entry/${teamId}/history/`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return undefined
  }
}

/**
 * Fetch a player's season so far, with opponent_team converted to understat team ids.
 * @param playerId - The player's id, the `id` field in bootstrap-static's `elements`.
 * @returns The summary; undefined if the request fails.
 */
export async function fetchPlayerSummary(playerId: number): Promise<PlayerSummary | undefined> {
  try {
    const response = await fetch(`/fpl-api/element-summary/${playerId}/`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data: { history: PlayerMatch[] } = await response.json()

    const history = data.history.flatMap((match) => {
      const opponent_team = understatTeamId(match.opponent_team)

      if (opponent_team === undefined) {
        console.warn(`Skipping fixture ${match.fixture}: unmapped FPL team id`)
        return []
      }

      return [{ ...match, opponent_team }]
    })

    return { history }
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return undefined
  }
}
