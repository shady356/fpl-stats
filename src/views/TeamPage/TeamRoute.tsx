import { useParams } from 'react-router'

import type { Team } from '@/types/team'

import TeamPage from './TeamPage'

type TeamRouteProps = {
  teams: Team[]
}

function TeamRoute({ teams }: TeamRouteProps) {
  const { teamId } = useParams()
  const team = teams.find((team) => team.team_id === Number(teamId))

  if (!team) return <p>Team not found</p>

  return <TeamPage team={team} />
}

export default TeamRoute
