import FavoriteButton from '@/components/FavoriteButton/FavoriteButton'
import PlayerLink from '@/components/PlayerLink/PlayerLink'
import PlayerThumbnail from '@/components/ui/PlayerThumbnail/PlayerThumbnail'
import Table from '@/components/ui/Table/Table'
import TableHeaderCell, { type SortOrder } from '@/components/ui/Table/TableHeaderCell'
import type { Player } from '@/types/player'
import { POSITION_SHORT_LABELS } from '@/utils/positions'

import { PLAYER_COLUMNS, type PlayerColumn, type PlayerColumnKey } from '../playersTableColumns'

type PlayersTableProps = {
  /** Already filtered and sorted. */
  players: Player[]
  teamShortNames: Map<number, string>
  sortKey: PlayerColumnKey
  sortOrder: SortOrder
  onSort: (key: PlayerColumnKey) => void
}

function PlayersTable({ players, teamShortNames, sortKey, sortOrder, onSort }: PlayersTableProps) {
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
              <PlayerCell
                key={column.key}
                column={column}
                player={player}
                teamShortNames={teamShortNames}
              />
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
  teamShortNames: Map<number, string>
}

function PlayerCell({ column, player, teamShortNames }: PlayerCellProps) {
  if (column.key === 'web_name') {
    return (
      <td>
        <span className="players-table-name">
          <FavoriteButton playerId={player.id} playerName={player.web_name} />
          <PlayerThumbnail code={player.code} size="small" position={player.element_type} />
          <PlayerLink playerId={player.id}>{player.web_name}</PlayerLink>
          <span className="players-table-position">
            {POSITION_SHORT_LABELS[player.element_type]}
          </span>
        </span>
      </td>
    )
  }

  return (
    <td style={{ textAlign: column.align }}>
      {column.format ? column.format(player) : column.value(player, teamShortNames)}
    </td>
  )
}

export default PlayersTable
