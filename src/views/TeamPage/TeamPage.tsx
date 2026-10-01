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
        {team.badge_url && <img className="team-badge" src={team.badge_url} alt="" />}
        <h1 className="team-name">{team.team_name}</h1>

        <StarRating score={team.rating_total} />
      </div>

      <pre>{JSON.stringify(team, null, 2)}</pre>
    </>
  )
}

export default TeamPage
