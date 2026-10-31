import type { ReactNode } from 'react'
import { Link } from 'react-router'

import './PlayerLink.css'

type PlayerLinkProps = {
  /** Player id, the `id` field in bootstrap-static's `elements`. */
  playerId: number
  children: ReactNode
  className?: string
}

/**
 * Link to a player's page, styled to sit inline in lists and tables.
 */
export default function PlayerLink({ playerId, children, className }: PlayerLinkProps) {
  const classes = ['player-link', className].filter(Boolean).join(' ')

  return (
    <Link to={`/player/${playerId}`} className={classes}>
      {children}
    </Link>
  )
}
