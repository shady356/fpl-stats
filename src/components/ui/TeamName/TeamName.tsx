import { NavLink } from 'react-router'

import TeamBadge from '@/components/ui/TeamBadge/TeamBadge.tsx'
import type { Team } from '@/types/team.ts'

import './TeamName.css'

type TeamNameProps = {
  team: Pick<Team, 'team_id' | 'team_name'>
  color?: string
}

function TeamName({ team, color = 'transparent' }: TeamNameProps) {
  return (
    <NavLink
      to={`/team/${team.team_id}`}
      className="team-name"
      style={{ background: `linear-gradient(90deg, ${color} 0%, rgba(0, 0, 0, 0) 100%)` }}
    >
      <TeamBadge teamId={team.team_id} size="small" />
      {team.team_name}
    </NavLink>
  )
}

export default TeamName
