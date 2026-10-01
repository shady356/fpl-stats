import type { Team } from '@/types/team'

import './TeamPage.css'

import { Suspense, use } from 'react'

import StarRating from '@/components/ui/StarRating/StarRating'
import TeamBadge from '@/components/ui/TeamBadge/TeamBadge'
import { fetchFixtures } from '@/services/FplAPI'
import type { Fixture } from '@/types/fixture'
import { fplTeamId } from '@/utils/teamIds'

type TeamPageProps = {
  team: Team
}

function TeamPage({ team }: TeamPageProps) {
  const fixturesPromise = fetchFixtures({ team: fplTeamId(team.team_id), future: true })
  return (
    <div className="team-page">
      <TeamCard team={team} />
      <Suspense fallback={<p>Loading fixtures…</p>}>
        <FixturesList fixturesPromise={fixturesPromise} team={team} />
      </Suspense>
    </div>
  )
}

function FixturesList({
  fixturesPromise,
  team,
}: {
  fixturesPromise: Promise<Fixture[]>
  team: Team
}) {
  const fixtures = use(fixturesPromise)
  return (
    <section className="card fixtures">
      <h2>Fixtures</h2>
      <ul>
        {fixtures.map((fixture) => (
          <li key={fixture.id}>
            <MatchCard fixture={fixture} team={team} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function TeamCard({ team }: TeamPageProps) {
  return (
    <section className="card team">
      <h1 className="team-name">{team.team_name}</h1>
      <TeamBadge teamId={team.team_id} size="large" />
      <StarRating score={team.rating_total} size="large" />

      <div className="team-ratings">
        <div className="team-rating">
          <span className="label">ATT</span>
          <span className="score">{Math.round(team.rating_attack)}</span>
        </div>

        <div className="team-rating">
          <span className="label">DEF</span>
          <span className="score">{Math.round(team.rating_defense)}</span>
        </div>
      </div>
    </section>
  )
}

function MatchCard({ fixture, team }: { fixture: Fixture; team: Team }) {
  const isHomeTeam = fixture.team_h === team.team_id
  // const opponentTeamId = isHomeTeam ? fixture.team_a : fixture.team_h

  return (
    <div className="match-card">
      <div className={`team team-h ${isHomeTeam ? 'home' : 'away'}`}>{fixture.team_h}</div>
      <div className="team team-a">{fixture.team_a}</div>
    </div>
  )
}

export default TeamPage
