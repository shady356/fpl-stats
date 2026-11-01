import PlayerLink from '@/components/PlayerLink/PlayerLink'
import Icon from '@/components/ui/Icon/Icon.tsx'
import PlayerPhoto from '@/components/ui/PlayerPhoto/PlayerPhoto.tsx'
import type { LineupPlayer } from '@/types/myTeam'

/**
 * One player on the pitch: photo, name and gameweek points, marked when captained,
 * automatically subbed, or when they didn't play.
 */
export default function PitchPlayer({ lineupPlayer }: { lineupPlayer: LineupPlayer }) {
  const { pick, player, minutes, points, subbedIn, subbedOut } = lineupPlayer
  const didNotPlay = minutes === 0

  const classes = ['pitch-player', didNotPlay && 'pitch-player-dnp'].filter(Boolean).join(' ')
  const title = [
    player?.web_name,
    `${minutes} min`,
    subbedIn && 'auto-subbed in',
    subbedOut && 'auto-subbed out',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={classes} title={title}>
      <div className="pitch-player-photo">
        {player && <PlayerPhoto code={player.code} />}
        {(pick.is_captain || pick.is_vice_captain) && (
          <span className="pitch-player-armband">{pick.is_captain ? 'C' : 'V'}</span>
        )}
        {(subbedIn || subbedOut) && (
          <span
            className={`pitch-player-sub ${subbedIn ? 'pitch-player-sub-in' : 'pitch-player-sub-out'}`}
            aria-label={subbedIn ? 'Subbed in' : 'Subbed out'}
          >
            <Icon icon={subbedIn ? 'arrow_upward' : 'arrow_downward'} />
          </span>
        )}
      </div>
      <span className="pitch-player-name">
        {player ? <PlayerLink playerId={player.id}>{player.web_name}</PlayerLink> : 'Unknown'}
      </span>
      <span className="pitch-player-points">{points}</span>
    </div>
  )
}
