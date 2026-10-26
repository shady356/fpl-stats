import { useState } from 'react'

import placeholderUrl from '@/assets/player_placeholder.svg'
import type { PlayerPosition } from '@/types/player'
import { playerPhotoUrl } from '@/utils/playerPhotos'
import { positionColor } from '@/utils/positions'

import './PlayerThumbnail.css'

type PlayerThumbnailProps = {
  /** Premier League player code. */
  code: number
  /** Colors the background by position; neutral when omitted. */
  position?: PlayerPosition
  size?: 'small' | 'medium' | 'large'
}

/**
 * Small round player face for lists and tables.
 */
export default function PlayerThumbnail({ code, size = 'medium', position }: PlayerThumbnailProps) {
  // Not every player has a photo; fall back to a silhouette.
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={`player-thumbnail ${size}`}
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
