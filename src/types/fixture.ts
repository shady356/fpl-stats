export type Fixture = {
  code: number
  event: number
  id: number
  kickoff_time: string
  started: boolean
  team_a: number
  team_h: number
}

export type TeamFixture = {
  fixtures: [
    {
      fixture_id: number
      event: number
      is_home: boolean
      opponent: {
        team_name: string
        short_name: string
        rating_total_color: string
      }
    },
  ]
}
