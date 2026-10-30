import type { EntryPicks, Lineup, LineupPlayer, LivePlayerStats } from '@/types/myTeam'
import type { Player, PlayerPosition } from '@/types/player'

const STARTING_XI_SIZE = 11
const PITCH_ROWS: PlayerPosition[] = [1, 2, 3, 4]

/**
 * Split a gameweek's picks into formation rows and a bench, with each player's points.
 * @param entryPicks - The manager's picks for the gameweek; automatic subs are already applied.
 * @param players - All players from bootstrap-static.
 * @param live - Gameweek stats by player id.
 * @returns The starting XI by position and the bench in sub order.
 */
export function buildLineup(
  entryPicks: EntryPicks,
  players: Player[],
  live: Map<number, LivePlayerStats>,
): Lineup {
  const playersById = new Map(players.map((player) => [player.id, player]))
  const subbedIn = new Set(entryPicks.automatic_subs.map((sub) => sub.element_in))
  const subbedOut = new Set(entryPicks.automatic_subs.map((sub) => sub.element_out))

  const lineupPlayers: LineupPlayer[] = entryPicks.picks
    .toSorted((a, b) => a.position - b.position)
    .map((pick) => {
      const stats = live.get(pick.element)
      const points = stats?.total_points ?? 0
      return {
        pick,
        player: playersById.get(pick.element),
        minutes: stats?.minutes ?? 0,
        // Bench players have multiplier 0, but their points are still worth showing.
        points: points * Math.max(pick.multiplier, 1),
        subbedIn: subbedIn.has(pick.element),
        subbedOut: subbedOut.has(pick.element),
      }
    })

  const startingXI = lineupPlayers.slice(0, STARTING_XI_SIZE)

  return {
    rows: PITCH_ROWS.map((position) =>
      startingXI.filter(({ pick }) => pick.element_type === position),
    ),
    bench: lineupPlayers.slice(STARTING_XI_SIZE),
  }
}
