import type { ReactNode } from 'react'

import PlayerThumbnail from '@/components/ui/PlayerThumbnail/PlayerThumbnail'
import type { Player } from '@/types/player'
import { POSITION_SHORT_LABELS } from '@/utils/positions'

import './PlayerListCard.css'

export type PlayerListRow = {
  player: Player
  /** The stat the list is ranked by, shown on the right. */
  value: ReactNode
  /** Shown under the player's name, e.g. upcoming fixtures. */
  extra?: ReactNode
}

type PlayerListCardProps = {
  title: string
  description: string
  rows: PlayerListRow[]
  /** Short names by understat team_id. */
  teamShortNames: Map<number, string>
  /** Controls shown next to the title, e.g. a position filter. */
  controls?: ReactNode
  /** Tone of the ranked value. */
  tone?: 'positive' | 'negative'
}

/**
 * Dashboard card with a ranked list of players.
 */
export default function PlayerListCard({
  title,
  description,
  rows,
  teamShortNames,
  controls,
  tone,
}: PlayerListCardProps) {
  return (
    <section className="player-list-card">
      <div className="player-list-card-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {controls}
      </div>

      {rows.length === 0 ? (
        <p>No players yet.</p>
      ) : (
        <ol className="player-list-card-players">
          {rows.map(({ player, value, extra }, index) => (
            <li key={player.id}>
              <span className="player-list-card-rank">{index + 1}</span>
              <PlayerThumbnail code={player.code} position={player.element_type} size="large" />
              <div className="player-list-card-name">
                <span>{player.web_name}</span>
                <span className="player-list-card-details">
                  {teamShortNames.get(player.team) ?? '–'} ·{' '}
                  {POSITION_SHORT_LABELS[player.element_type]} · £
                  {(player.now_cost / 10).toFixed(1)}m · {player.selected_by_percent}%
                </span>
                {extra}
              </div>
              <span className={`player-list-card-value ${tone ?? ''}`}>{value}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
