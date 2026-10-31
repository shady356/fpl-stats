import { useState, type ReactNode } from 'react'

import PlayerLink from '@/components/PlayerLink/PlayerLink'
import PlayerThumbnail from '@/components/ui/PlayerThumbnail/PlayerThumbnail'
import Table from '@/components/ui/Table/Table'
import TableHeaderCell from '@/components/ui/Table/TableHeaderCell'
import { usePlayers } from '@/hooks/usePlayers'
import type { Player, PlayerPosition } from '@/types/player'
import type { Team } from '@/types/team'

import './Squad.css'

const POSITIONS: { position: PlayerPosition; label: string }[] = [
  { position: 1, label: 'Goalkeepers' },
  { position: 2, label: 'Defenders' },
  { position: 3, label: 'Midfielders' },
  { position: 4, label: 'Forwards' },
]

type PlayerColumn = {
  label: string
  title: string
  align: 'left' | 'right'
  /** Value to sort by. */
  value: (player: Player) => number | string
  render: (player: Player) => ReactNode
}

const PLAYER_COLUMNS: PlayerColumn[] = [
  {
    label: 'Player',
    title: 'Player',
    align: 'left',
    value: (player) => player.web_name,
    render: (player) => (
      <span className="player-list-name">
        <PlayerThumbnail code={player.code} size="small" position={player.element_type} />
        <PlayerLink playerId={player.id}>{player.web_name}</PlayerLink>
      </span>
    ),
  },
  {
    label: 'Price',
    title: 'Price',
    align: 'right',
    value: (player) => player.now_cost,
    render: (player) => `£${(player.now_cost / 10).toFixed(1)}m`,
  },
  {
    label: '+/-',
    title: 'Price change',
    align: 'right',
    value: (player) => player.cost_change_start,
    render: (player) =>
      `${player.cost_change_start > 0 ? '+' : ''}${(player.cost_change_start / 10).toFixed(1)}`,
  },
  {
    label: 'Min',
    title: 'Minutes played',
    align: 'right',
    value: (player) => player.minutes,
    render: (player) => player.minutes,
  },
  {
    label: 'Form',
    title: 'Form',
    align: 'right',
    value: (player) => Number(player.form),
    render: (player) => player.form,
  },
  {
    label: 'Sel.',
    title: 'Selected by',
    align: 'right',
    value: (player) => Number(player.selected_by_percent),
    render: (player) => `${player.selected_by_percent}%`,
  },
  {
    label: 'Pts',
    title: 'Total points',
    align: 'right',
    value: (player) => player.total_points,
    render: (player) => player.total_points,
  },
]

/** Index of the column the tables are sorted by initially (total points). */
const DEFAULT_SORT_COLUMN = PLAYER_COLUMNS.length - 1

/**
 * The team's players, one table per position, all sorted by the selected column.
 */
export default function Squad({ team }: { team: Team }) {
  const [sortColumn, setSortColumn] = useState(DEFAULT_SORT_COLUMN)
  const players = usePlayers().filter((player) => player.team === team.team_id)

  const { value } = PLAYER_COLUMNS[sortColumn]
  const sortedPlayers = players.toSorted((a, b) => {
    const aVal = value(a)
    const bVal = value(b)
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return bVal - aVal
    }
    return String(aVal).localeCompare(String(bVal))
  })

  return (
    <section className="card squad">
      <div className="card-header">
        <h2>Players</h2>
        <label className="squad-sort">
          Sort by
          <select value={sortColumn} onChange={(e) => setSortColumn(Number(e.target.value))}>
            {PLAYER_COLUMNS.map((column, index) => (
              <option key={column.label} value={index}>
                {column.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {POSITIONS.map(({ position, label }) => (
        <PlayerList
          key={position}
          label={label}
          players={sortedPlayers.filter((player) => player.element_type === position)}
        />
      ))}
    </section>
  )
}

function PlayerList({ label, players }: { label: string; players: Player[] }) {
  return (
    <Table className="player-list">
      <thead>
        <tr>
          {PLAYER_COLUMNS.map((column, index) => (
            <TableHeaderCell key={column.label} align={column.align} title={column.title}>
              {index === 0 ? label : column.label}
            </TableHeaderCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {players.map((player) => (
          <tr key={player.id} className={player.status === 'a' ? undefined : 'unavailable'}>
            {PLAYER_COLUMNS.map((column) => (
              <td key={column.label} style={{ textAlign: column.align }}>
                {column.render(player)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
