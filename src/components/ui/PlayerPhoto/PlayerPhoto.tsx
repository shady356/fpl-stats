import { useState } from 'react'

import placeholderUrl from '@/assets/player_placeholder.svg'
import { playerPhotoUrl } from '@/utils/playerPhotos'

import './PlayerPhoto.css'

type PlayerPhotoProps = {
  /** Premier League player code. */
  code: number
  size?: 'small' | 'large'
}

export default function PlayerPhoto({ code, size = 'small' }: PlayerPhotoProps) {
  // Not every player has a photo; fall back to a silhouette.
  const [failed, setFailed] = useState(false)

  return (
    <span className={`player-photo ${size}`}>
      <img
        src={failed ? placeholderUrl : playerPhotoUrl(code)}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </span>
  )
}
