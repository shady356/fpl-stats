import type { Fixture } from '@/types/fixture'

export async function fetchFixtures(): Promise<Fixture[]> {
  try {
    const response = await fetch(`https://fantasy.premierleague.com/api/fixtures/?future=1`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data: Fixture[] = await response.json()
    return data
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return []
  }
}
