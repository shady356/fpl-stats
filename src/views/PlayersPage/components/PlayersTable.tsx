import FavoriteButton from '@/components/FavoriteButton/FavoriteButton'
import PlayerLink from '@/components/PlayerLink/PlayerLink'
import PlayerThumbnail from '@/components/ui/PlayerThumbnail/PlayerThumbnail'
import PositionTag from '@/components/ui/PositionTag/PositionTag'
import Table from '@/components/ui/Table/Table'
import TableHeaderCell, { type SortOrder } from '@/components/ui/Table/TableHeaderCell'
import type { Player } from '@/types/player'

import { PLAYER_COLUMNS, type PlayerColumn, type PlayerColumnKey } from '../playersTableColumns'

type PlayersTableProps = {
  /** Already filtered and sorted. */
  players: Player[]
  /** Team name by team id, shown under each player's name. */
  teamNames: Map<number, string>
  sortKey: PlayerColumnKey
  sortOrder: SortOrder
  onSort: (key: PlayerColumnKey) => void
}

function PlayersTable({ players, teamNames, sortKey, sortOrder, onSort }: PlayersTableProps) {
  return (
    <Table className="players-table" scrollable>
      <thead>
        <tr>
          {PLAYER_COLUMNS.map((column) => (
            <TableHeaderCell
              key={column.key}
              align={column.align}
              title={column.tooltip}
              sortOrder={sortKey === column.key ? sortOrder : null}
              onSort={() => onSort(column.key)}
            >
              {column.label}
            </TableHeaderCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {players.map((player) => (
          <tr key={player.id} className={player.status === 'a' ? undefined : 'unavailable'}>
            {PLAYER_COLUMNS.map((column) => (
              <PlayerCell key={column.key} column={column} player={player} teamNames={teamNames} />
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

type PlayerCellProps = {
  column: PlayerColumn
  player: Player
  teamNames: Map<number, string>
}

function PlayerCell({ column, player, teamNames }: PlayerCellProps) {
  if (column.key === 'web_name') {
    return (
      <td>
        <span className="players-table-name">
          <FavoriteButton playerId={player.id} playerName={player.web_name} />
          <PlayerThumbnail code={player.code} />
          <span className="players-table-name-text">
            <PlayerLink playerId={player.id}>{player.web_name}</PlayerLink>
            <span className="players-table-team">{teamNames.get(player.team) ?? '–'}</span>
          </span>
        </span>
      </td>
    )
  }

  if (column.key === 'element_type') {
    return (
      <td>
        <PositionTag position={player.element_type} />
      </td>
    )
  }

  return (
    <td style={{ textAlign: column.align, color: column.color?.(player) }}>
      {column.format ? column.format(player) : column.value(player)}
    </td>
  )
}

export default PlayersTable
