import type { ReactNode } from 'react'

import PlayerLink from '@/components/PlayerLink/PlayerLink'
import Icon from '@/components/ui/Icon/Icon'
import PlayerThumbnail from '@/components/ui/PlayerThumbnail/PlayerThumbnail'
import PositionTag from '@/components/ui/PositionTag/PositionTag'
import type { Player } from '@/types/player'

import './PlayerListCard.css'

export type PlayerListRow = {
  player: Player
  /** The stat the list is ranked by, shown on the right. */
  value: ReactNode
  /** Shown under the player's name, or beside it when the card is wide, e.g. upcoming fixtures. */
  extra?: ReactNode
}

type PlayerListCardProps = {
  title: string
  description: string
  /** Material Symbols name shown next to the title. */
  icon: string
  rows: PlayerListRow[]
  /** Short names by understat team_id. */
  teamShortNames: Map<number, string>
  /** Controls shown under the title, e.g. view and position filters. */
  controls?: ReactNode
  /** Tone of the ranked value. */
  tone?: 'positive' | 'negative'
  /** Shown instead of the list when there are no rows. */
  emptyText?: string
  className?: string
}

/**
 * Dashboard card with a ranked list of players.
 */
export default function PlayerListCard({
  title,
  description,
  icon,
  rows,
  teamShortNames,
  controls,
  tone,
  emptyText = 'No players yet.',
  className,
}: PlayerListCardProps) {
  return (
    <section className={['player-list-card', className].filter(Boolean).join(' ')}>
      <div className="player-list-card-header">
        <span className="player-list-card-icon">
          <Icon icon={icon} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      {controls && <div className="player-list-card-controls">{controls}</div>}

      {rows.length === 0 ? (
        <p className="player-list-card-empty">{emptyText}</p>
      ) : (
        <ol className="player-list-card-players">
          {rows.map(({ player, value, extra }, index) => (
            <li key={player.id}>
              <span className="player-list-card-rank">{index + 1}</span>
              <PlayerThumbnail code={player.code} size="large" />
              <div className="player-list-card-main">
                <div className="player-list-card-name">
                  <PlayerLink playerId={player.id}>{player.web_name}</PlayerLink>
                  <span className="player-list-card-details">
                    <PositionTag position={player.element_type} />
                    {teamShortNames.get(player.team) ?? '–'} · £{(player.now_cost / 10).toFixed(1)}m
                    · {player.selected_by_percent}%
                  </span>
                </div>
                {extra && <div className="player-list-card-extra">{extra}</div>}
              </div>
              <span className={`player-list-card-value ${tone ?? ''}`}>{value}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
