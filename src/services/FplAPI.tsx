type FplFixture = {
  code: number
  event: number
  id: number
  kickoff_time: string
  started: boolean
  team_a: number
  team_h: number
}

export async function fetchFplFixtures(): Promise<FplFixture[]> {
  try {
    const response = await fetch(`https://fantasy.premierleague.com/api/fixtures/?future=1`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data: FplFixture[] = await response.json()
    return data
  } catch (error) {
    console.error(`Failed to fetch: ${error}`)
    return []
  }
}
