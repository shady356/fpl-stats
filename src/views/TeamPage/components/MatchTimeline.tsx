import { Suspense, use } from 'react'

import Icon from '@/components/ui/Icon/Icon'
import TeamBadge from '@/components/ui/TeamBadge/TeamBadge'
import type { Fixture } from '@/types/fixture'
import type { FormMatch, Team } from '@/types/team'
import { FORM_COLORS } from '@/utils/form'
import { teamShortName } from '@/utils/teamShortNames'

import './MatchTimeline.css'

/** Past matches shown before the next game. */
const TIMELINE_PAST_LENGTH = 3

/** Upcoming matches shown after the next game. */
const TIMELINE_UPCOMING_LENGTH = 4

/**
 * Last games, the next game and the games after it, top to bottom.
 */
export default function MatchTimeline({
  team,
  teams,
  fixturesPromise,
}: {
  team: Team
  teams: Team[]
  fixturesPromise: Promise<Fixture[]>
}) {
  return (
    <section className="match-timeline">
      <ol className="timeline-side past">
        {team.form.slice(-TIMELINE_PAST_LENGTH).map((match) => (
          <PastMatch key={match.match_id} match={match} teamId={team.team_id} />
        ))}
      </ol>

      <Suspense fallback={<UpcomingFixturesSkeleton />}>
        <UpcomingFixtures team={team} teams={teams} fixturesPromise={fixturesPromise} />
      </Suspense>
    </section>
  )
}

/**
 * The next game and the games after it, once the fixtures have loaded.
 */
function UpcomingFixtures({
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
    <>
      <NextGameCard next={next} teamName={teamName} />

      <ol className="timeline-side upcoming">
        {upcoming.slice(0, TIMELINE_UPCOMING_LENGTH).map((fixture) => (
          <UpcomingMatch
            key={fixture.id}
            fixture={fixture}
            teamId={team.team_id}
            teamName={teamName}
          />
        ))}
      </ol>
    </>
  )
}

/** Placeholder for the next game and upcoming matches while fixtures load. */
function UpcomingFixturesSkeleton() {
  return (
    <>
      <section className="card next-game" aria-busy="true" aria-label="Loading next game">
        <span className="skeleton next-game-gw skeleton-gw" />
        <h2>
          <span className="skeleton skeleton-heading" />
        </h2>
        <span className="skeleton next-game-meta skeleton-meta" />
        <div className="next-game-teams">
          {[0, 1].map((i) => (
            <div key={i} className="next-game-team">
              <span className="skeleton skeleton-badge medium" />
              <span className="skeleton skeleton-text" />
            </div>
          ))}
        </div>
      </section>

      <ol className="timeline-side upcoming" aria-hidden="true">
        {Array.from({ length: TIMELINE_UPCOMING_LENGTH }, (_, i) => (
          <li key={i} className="timeline-match">
            <span className="skeleton skeleton-icon" />
            <span className="skeleton skeleton-badge small" />
            <span className="skeleton skeleton-text" />
            <span className="skeleton skeleton-text short" />
          </li>
        ))}
      </ol>
    </>
  )
}

function VenueIcon({ isHome }: { isHome: boolean }) {
  return (
    <span className="timeline-venue" title={isHome ? 'Home' : 'Away'}>
      <Icon icon={isHome ? 'stadium' : 'flight_takeoff'} />
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

/** Kickoff times are shown in Norwegian time. */
const KICKOFF_TIME_ZONE = 'Europe/Oslo'

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

  const kickoff = new Date(next.kickoff_time)
  const date = kickoff.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    timeZone: KICKOFF_TIME_ZONE,
  })
  const weekday = kickoff.toLocaleDateString(undefined, {
    weekday: 'long',
    timeZone: KICKOFF_TIME_ZONE,
  })
  const time = kickoff.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: KICKOFF_TIME_ZONE,
  })

  return (
    <section className="card next-game">
      <span className="next-game-gw">Gameweek {next.event}</span>
      <h2>{date}</h2>
      <p className="next-game-meta">
        {weekday} · {time}
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
