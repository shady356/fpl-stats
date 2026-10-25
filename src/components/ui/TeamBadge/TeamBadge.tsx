import { teamBadgeUrl } from '@/utils/teamBadges.ts'

import './TeamBadge.css'

type TeamBadgeProps = {
  /** understat team_id. */
  teamId: number
  size?: 'tiny' | 'small' | 'medium' | 'large'
}

export default function TeamBadge({ teamId, size = 'small' }: TeamBadgeProps) {
  const url = teamBadgeUrl(teamId)
  if (!url) return null

  return <img className={`team-badge ${size}`} src={url} alt="" />
}
