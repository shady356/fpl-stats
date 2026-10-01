import type { Team } from '@/types/team'

import './TeamPage.css'

type TeamPageProps = {
  team: Team
}

function TeamPage({ team }: TeamPageProps) {
  return (
    <>
      {team.badge_url && <img src={team.badge_url} alt="" />}
      <h1>{team.team_name}</h1>
    </>
  )
}

export default TeamPage
