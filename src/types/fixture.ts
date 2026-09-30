import type { Team } from '@/types/team.ts'

export type Fixture = {
  code: number
  event: number
  id: number
  kickoff_time: string
  started: boolean
  team_a: number
  team_h: number
}

/**
 * One upcoming fixture from a team's point of view, as built by attachFixtures.
 */
export type TeamFixture = {
  fixture_id: number
  event: number
  is_home: boolean
  opponent: {
    team_name: string
    team_name_short: string
    rating_total_color: string
    rating_attack_color: string
    rating_defense_color: string
  }
}

/**
 * A team with its upcoming fixtures, sorted by kickoff.
 */
export type TeamWithFixtures = Team & {
  fixtures: TeamFixture[]
}
