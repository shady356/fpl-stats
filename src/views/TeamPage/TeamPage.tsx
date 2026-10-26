import type { Team } from '@/types/team'

import './TeamPage.css'

import { Suspense, useState } from 'react'

import BaseTab from '@/components/ui/BaseTabs/BaseTab'
import BaseTabs from '@/components/ui/BaseTabs/BaseTabs'
import StarRating from '@/components/ui/StarRating/StarRating'
import TeamBadge from '@/components/ui/TeamBadge/TeamBadge'
import { fetchFixtures } from '@/services/FplAPI'
import { ordinal } from '@/utils/ordinal'
import { teamFullName } from '@/utils/teamFullNames'
import { fplTeamId } from '@/utils/teamIds'

import MatchTimeline from './components/MatchTimeline'
import Squad from './components/Squad'
import TeamStyle from './components/TeamStyle'
import TopList from './components/TopList'

type TeamPageProps = {
  team: Team
  /** All teams, for looking up opponents. */
  teams: Team[]
}

type TeamTab = 'overview' | 'players'

const TEAM_TABS: { tab: TeamTab; label: string }[] = [
  { tab: 'overview', label: 'Overview' },
  { tab: 'players', label: 'Players' },
]

function TeamPage({ team, teams }: TeamPageProps) {
  const [tab, setTab] = useState<TeamTab>('overview')
  const fixturesPromise = fetchFixtures({ team: fplTeamId(team.team_id), future: true })
  return (
    <div className="team-page">
      <TeamHeader team={team} />

      <BaseTabs className="team-tabs" aria-label="Team view">
        {TEAM_TABS.map(({ tab: value, label }) => (
          <BaseTab key={value} selected={tab === value} onClick={() => setTab(value)}>
            {label}
          </BaseTab>
        ))}
      </BaseTabs>

      {tab === 'overview' ? (
        <div className="team-body">
          <MatchTimeline team={team} teams={teams} fixturesPromise={fixturesPromise} />
          <Suspense fallback={<p>Loading players…</p>}>
            <TopList team={team} />
          </Suspense>
          <TeamStyle team={team} teams={teams} />
        </div>
      ) : (
        <Suspense fallback={<p>Loading players…</p>}>
          <Squad team={team} />
        </Suspense>
      )}
    </div>
  )
}

function TeamHeader({ team }: { team: Team }) {
  return (
    <section className="team-header">
      <div className="left">
        <TeamBadge teamId={team.team_id} size="medium" />
        <div className="team-name-rating">
          <h1 className="team-name">{teamFullName(team.team_name)}</h1>
          <div>{ordinal(team.position)} place</div>
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

export default TeamPage
