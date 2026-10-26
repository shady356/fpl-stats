import { useState } from 'react'

import placeholderUrl from '@/assets/player_placeholder.svg'
import type { PlayerPosition } from '@/types/player'
import { playerPhotoUrl } from '@/utils/playerPhotos'
import { positionColor } from '@/utils/positions'

import './PlayerPhoto.css'

type PlayerPhotoProps = {
  /** Premier League player code. */
  code: number
  /** Colors the background by position; neutral when omitted. */
  position?: PlayerPosition
  size?: 'small' | 'large'
}

export default function PlayerPhoto({ code, size = 'small', position }: PlayerPhotoProps) {
  // Not every player has a photo; fall back to a silhouette.
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={`player-photo ${size}`}
      style={position && { background: positionColor(position) }}
    >
      <img
        src={failed ? placeholderUrl : playerPhotoUrl(code)}
        className={failed ? 'placeholder' : undefined}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </span>
  )
}
