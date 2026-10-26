import { useState } from 'react'

import placeholderUrl from '@/assets/player_placeholder.svg'
import { playerPhotoUrl } from '@/utils/playerPhotos'

import './PlayerPhoto.css'

type PlayerPhotoProps = {
  /** Premier League player code. */
  code: number
}

export default function PlayerPhoto({ code }: PlayerPhotoProps) {
  // Not every player has a photo; fall back to a silhouette.
  const [failed, setFailed] = useState(false)

  return (
    <img
      className="player-photo"
      src={failed ? placeholderUrl : playerPhotoUrl(code)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
