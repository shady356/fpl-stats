import Icon from '@/components/ui/Icon/Icon'
import type { Player } from '@/types/player'
import { playerStatus } from '@/utils/playerStatus'

import './PlayerStatusIcon.css'

type PlayerStatusIconProps = {
  player: Player
}

/**
 * Icon flagging an injured, doubtful or otherwise unavailable player, with FPL's news on hover.
 * Renders nothing when the player is available.
 */
export default function PlayerStatusIcon({ player }: PlayerStatusIconProps) {
  const status = playerStatus(player.status)
  if (!status) return null

  const text = player.news || status.label

  return (
    <span
      className="player-status-icon"
      role="img"
      aria-label={text}
      title={text}
      style={{ color: status.color }}
    >
      <Icon icon={status.icon} />
    </span>
  )
}
