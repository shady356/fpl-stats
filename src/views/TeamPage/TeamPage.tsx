import type { Team } from '@/types/team'

import './TeamPage.css'

import StarRating from '@/components/ui/StarRating/StarRating'

type TeamPageProps = {
  team: Team
}

function TeamPage({ team }: TeamPageProps) {
  return (
    <>
      <div className="card team">
        <h1 className="team-name">{team.team_name}</h1>
        {team.badge_url && <img className="team-badge" src={team.badge_url} alt="" />}
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
      </div>

      <pre>{JSON.stringify(team, null, 2)}</pre>
    </>
  )
}

export default TeamPage
