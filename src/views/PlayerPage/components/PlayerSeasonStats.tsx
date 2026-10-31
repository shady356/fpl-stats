import type { ReactNode } from 'react'

import Icon from '@/components/ui/Icon/Icon'
import type { Player } from '@/types/player'

import BookingCard from './BookingCard.tsx'

function formatChange(tenths: number): string {
  return `${tenths >= 0 ? '+' : '-'}£${(Math.abs(tenths) / 10).toFixed(1)}m`
}

/**
 * The player's season totals from bootstrap-static, laid out like a game's player card:
 * key facts, then a summary list.
 * Longer explanations are in each row's hover title.
 */
export default function PlayerSeasonStats({ player }: { player: Player }) {
  const isKeeper = player.element_type === 1

  return (
    <section className="player-card player-season-stats" aria-label="Season stats">
      <dl className="player-stats-facts">
        <Fact label="Points" value={player.total_points} title="Total points this season" />
        <Fact
          label="Price change"
          value={formatChange(player.cost_change_start)}
          title={
            player.cost_change_event === 0
              ? 'Since the start of the season'
              : `${formatChange(player.cost_change_event)} this GW`
          }
        />
        <Fact
          label="Owned"
          value={`${player.selected_by_percent}%`}
          title="Percentage of FPL managers who own the player"
        />
      </dl>

      <div className="player-stats-summary">
        <h3>Summary</h3>
        <dl className="player-stats-list">
          <StatRow
            icon="sports_soccer"
            label="Goals"
            value={player.goals_scored}
            title={`${player.expected_goals} xG`}
          />
          <StatRow
            icon="timer"
            color="time"
            label="Minutes"
            value={player.minutes}
            title={`${player.starts} starts`}
          />
          <StatRow
            icon="handshake"
            label="Assists"
            value={player.assists}
            title={`${player.expected_assists} xA`}
          />
          <StatRow
            icon={<BookingCard color="yellow" />}
            label="Yellow cards"
            value={player.yellow_cards}
          />
          {isKeeper ? (
            <StatRow icon="sports_handball" label="Saves" value={player.saves} />
          ) : (
            <StatRow
              icon="block"
              label="DefCon"
              value={player.defensive_contribution}
              title="Defensive contributions"
            />
          )}
          <StatRow icon={<BookingCard color="red" />} label="Red cards" value={player.red_cards} />
          <StatRow icon="add_circle" label="Bonus" value={player.bonus} />
        </dl>
      </div>
    </section>
  )
}

type FactProps = {
  label: string
  value: ReactNode
  /** Longer explanation shown on hover. */
  title?: string
}

function Fact({ label, value, title }: FactProps) {
  return (
    <div className="player-stats-fact" title={title}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

type StatRowProps = {
  /** Material Symbols name, or a custom element that brings its own colour. */
  icon: string | ReactNode
  /** Colours the value and icon. */
  color?: 'time'
  label: string
  value: ReactNode
  /** Longer explanation shown on hover. */
  title?: string
}

function StatRow({ icon, color, label, value, title }: StatRowProps) {
  return (
    <div className={`player-stats-row ${color ?? ''}`} title={title}>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <span className="player-stats-row-icon">
        {typeof icon === 'string' ? <Icon icon={icon} /> : icon}
      </span>
    </div>
  )
}
