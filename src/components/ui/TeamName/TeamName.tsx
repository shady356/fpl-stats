import { NavLink } from 'react-router'

import type { Team } from '@/types/team.ts'

import './TeamName.css'

type TeamNameProps = {
  team: Pick<Team, 'team_id' | 'team_name' | 'badge_url'>
  color?: string
}

function TeamName({ team, color = 'transparent' }: TeamNameProps) {
  return (
    <NavLink
      to={`/team/${team.team_id}`}
      className="team-name"
      style={{ background: `linear-gradient(90deg, ${color} 0%, rgba(0, 0, 0, 0) 100%)` }}
    >
      {team.badge_url && <img className="team-badge" src={team.badge_url} alt="" />}
      {team.team_name}
    </NavLink>
  )
}

export default TeamName
