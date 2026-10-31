import { useState } from 'react'

import placeholderUrl from '@/assets/player_placeholder.svg'
import { playerPhotoUrl } from '@/utils/playerPhotos'

import './PlayerThumbnail.css'

type PlayerThumbnailProps = {
  /** Premier League player code. */
  code: number
  size?: 'small' | 'medium' | 'large'
}

/**
 * Small round player face for lists and tables.
 */
export default function PlayerThumbnail({ code, size = 'medium' }: PlayerThumbnailProps) {
  // Not every player has a photo; fall back to a silhouette.
  const [failed, setFailed] = useState(false)

  return (
    <span className={`player-thumbnail ${size}`}>
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
