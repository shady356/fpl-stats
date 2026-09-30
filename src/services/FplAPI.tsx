import type { Fixture } from '@/types/fixture'
import { understatTeamId } from '@/utils/teamIds'

export async function fetchFixtures(): Promise<Fixture[]> {
  try {
    const response = await fetch(`/fpl-api/fixtures/?future=1`)

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
