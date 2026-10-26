import type { FormMatch, Team } from '@/types/team'

import './TeamPage.css'

import { Suspense, use } from 'react'

import Icon from '@/components/ui/Icon/Icon'
import StarRating from '@/components/ui/StarRating/StarRating'
import TeamBadge from '@/components/ui/TeamBadge/TeamBadge'
import { fetchFixtures } from '@/services/FplAPI'
import type { Fixture } from '@/types/fixture'
import { FORM_COLORS } from '@/utils/form'
import { fplTeamId } from '@/utils/teamIds'
import { teamShortName } from '@/utils/teamShortNames'

type TeamPageProps = {
  team: Team
  /** All teams, for looking up opponents. */
  teams: Team[]
}

function TeamPage({ team, teams }: TeamPageProps) {
  const fixturesPromise = fetchFixtures({ team: fplTeamId(team.team_id), future: true })
  return (
    <div className="team-page">
      <TeamHeader team={team} />
      <Suspense fallback={<p>Loading fixtures…</p>}>
        <MatchTimeline team={team} teams={teams} fixturesPromise={fixturesPromise} />
      </Suspense>
    </div>
  )
}

function TeamHeader({ team }: { team: Team }) {
  return (
    <section className="team-header">
      <div className="left">
        <TeamBadge teamId={team.team_id} size="medium" />
        <div className="team-name-rating">
          <h1 className="team-name">{team.team_name}</h1>
          <div>{team.position}th place</div>
        </div>
      </div>

      <div className="team-ratings">
        <div className="team-rating">
          <span className="label">RATING</span>
          <StarRating score={team.rating_total} size="small" />
        </div>

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

/** Matches shown on each side of the next game. */
const TIMELINE_SIDE_LENGTH = 4

/**
 * Last games, the next game and the games after it, left to right.
 */
function MatchTimeline({
  team,
  teams,
  fixturesPromise,
}: {
  team: Team
  teams: Team[]
  fixturesPromise: Promise<Fixture[]>
}) {
  const fixtures = use(fixturesPromise).toSorted((a, b) =>
    a.kickoff_time.localeCompare(b.kickoff_time),
  )
  const [next, ...upcoming] = fixtures
  const teamName = (teamId: number) =>
    teamShortName(teams.find((t) => t.team_id === teamId)?.team_name ?? '')

  return (
    <section className="match-timeline">
      <ol className="timeline-side past">
        {team.form.slice(-TIMELINE_SIDE_LENGTH).map((match) => (
          <PastMatch key={match.match_id} match={match} teamId={team.team_id} />
        ))}
      </ol>

      <NextGameCard next={next} teamName={teamName} />

      <ol className="timeline-side upcoming">
        {upcoming.slice(0, TIMELINE_SIDE_LENGTH).map((fixture) => (
          <UpcomingMatch
            key={fixture.id}
            fixture={fixture}
            teamId={team.team_id}
            teamName={teamName}
          />
        ))}
      </ol>
    </section>
  )
}

function VenueIcon({ isHome }: { isHome: boolean }) {
  return (
    <span className="timeline-venue" title={isHome ? 'Home' : 'Away'}>
      <Icon icon={isHome ? 'home' : 'flight'} />
    </span>
  )
}

function PastMatch({ match, teamId }: { match: FormMatch; teamId: number }) {
  const isHome = match.home_team_id === teamId
  const opponentId = isHome ? match.away_team_id : match.home_team_id
  const opponent = isHome ? match.away_team : match.home_team
  const [goalsFor, goalsAgainst] = isHome
    ? [match.home_goals, match.away_goals]
    : [match.away_goals, match.home_goals]

  return (
    <li className="timeline-match">
      <VenueIcon isHome={isHome} />
      <TeamBadge teamId={opponentId} size="small" />
      <span className="timeline-opponent">{teamShortName(opponent)}</span>
      <span className="timeline-result" style={{ background: FORM_COLORS[match.result] }}>
        {goalsFor} - {goalsAgainst}
      </span>
    </li>
  )
}

function UpcomingMatch({
  fixture,
  teamId,
  teamName,
}: {
  fixture: Fixture
  teamId: number
  teamName: (teamId: number) => string
}) {
  const isHome = fixture.team_h === teamId
  const opponentId = isHome ? fixture.team_a : fixture.team_h

  return (
    <li className="timeline-match">
      <VenueIcon isHome={isHome} />
      <TeamBadge teamId={opponentId} size="small" />
      <span className="timeline-opponent">{teamName(opponentId)}</span>
      <span className="timeline-gw">GW {fixture.event}</span>
    </li>
  )
}

function NextGameCard({
  next,
  teamName,
}: {
  next: Fixture | undefined
  teamName: (teamId: number) => string
}) {
  if (!next) {
    return (
      <section className="card next-game">
        <h2>Next game</h2>
        <p>No upcoming games.</p>
      </section>
    )
  }

  const kickoff = new Date(next.kickoff_time).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <section className="card next-game">
      <h2>Next game</h2>
      <p className="next-game-meta">
        GW {next.event} · {kickoff}
      </p>
      <div className="next-game-teams">
        <div className="next-game-team">
          <TeamBadge teamId={next.team_h} size="medium" />
          {teamName(next.team_h)}
        </div>
        <span className="next-game-vs">vs</span>
        <div className="next-game-team">
          <TeamBadge teamId={next.team_a} size="medium" />
          {teamName(next.team_a)}
        </div>
      </div>
    </section>
  )
}

export default TeamPage
