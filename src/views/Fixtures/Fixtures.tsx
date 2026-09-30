import { Suspense, use } from 'react'

import { fetchFixtures } from '@/services/FplAPI'
import type { Fixture, TeamFixture, TeamWithFixtures } from '@/types/fixture.ts'
import type { Team } from '@/types/team.ts'

const fixturesPromise = fetchFixtures()

type FixtureProps = {
  teams: Team[]
}

function Fixtures({ teams }: FixtureProps) {
  return (
    <Suspense fallback={<p>Loading fixtures…</p>}>
      <FixtureList teams={teams} />
    </Suspense>
  )
}

//{
//    "team_id": 88,
//    "team_name": "Man City",
//    "badge_url": "https://resources.premierleague.com/premierleague25/badges-alt/43.svg",
//    "fixtures": [
//      {
//        "fixture_id": 58,
//        "event": 6,
//        "is_home": false,
//        "opponent": {
//          "team_name": "Liverpool",
//          "short_name": "Liverpool",
//          "rating_total_color": "rgb(233, 44, 91)"
//          "rating_attack_color": "rgb(108, 108, 108)",
//          "rating_defense_color": "rgb(233, 44, 91)"
//        }
//      },
//      {

function FixtureList({ teams }: FixtureProps) {
  const fixtures = use(fixturesPromise)
  const teamWithFixtures = getTeamFixtureList(teams, fixtures)

  const gameweeks = new Array(33).fill(0)

  return (
    <table>
      <thead>
        <tr>
          <th>Teams</th>
          {gameweeks.map((_, i) => (
            <th key={i}>{`GW ${i + 6}`}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {teamWithFixtures.map((team) => (
          <tr key={team.team_id}>
            <td>{team.team_name}</td>
            {team.fixtures.map((fixture) => (
              <td
                key={fixture.fixture_id}
                style={{ background: fixture.opponent.rating_total_color }}
              >
                {fixture.opponent.team_name}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function getTeamFixtureList(teams: Team[], fixtures: Fixture[]): TeamWithFixtures[] {
  return teams.map((team) => ({
    ...team,
    fixtures: fixtures
      .filter((fixture) => fixture.team_h === team.team_id || fixture.team_a === team.team_id)
      .flatMap((fixture) => {
        const isHome = fixture.team_h === team.team_id
        const opponentId = isHome ? fixture.team_a : fixture.team_h
        const opponent = teams.find((team) => team.team_id === opponentId)
        return opponent ? [toTeamFixture(fixture, opponent, isHome)] : []
      }),
  }))
}

function toTeamFixture(fixture: Fixture, opponent: Team, isHome: boolean): TeamFixture {
  return {
    fixture_id: fixture.id,
    event: fixture.event,
    is_home: isHome,
    opponent: {
      team_name: opponent.team_name,
      short_name: opponent.team_name, // Team has no short_name yet
      rating_total_color: opponent.rating_total_color,
      rating_attack_color: opponent.rating_attack_color,
      rating_defense_color: opponent.rating_defense_color,
    },
  }
}

export default Fixtures
