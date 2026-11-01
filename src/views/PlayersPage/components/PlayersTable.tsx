import { useState } from 'react'
import { useNavigate } from 'react-router'

import FavoriteButton from '@/components/FavoriteButton/FavoriteButton'
import PlayerLink from '@/components/PlayerLink/PlayerLink'
import PlayerStatusIcon from '@/components/PlayerStatusIcon/PlayerStatusIcon'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import PlayerThumbnail from '@/components/ui/PlayerThumbnail/PlayerThumbnail'
import PositionTag from '@/components/ui/PositionTag/PositionTag'
import Table from '@/components/ui/Table/Table'
import TableHeaderCell, { type SortOrder } from '@/components/ui/Table/TableHeaderCell'
import type { Player } from '@/types/player'
import { comparisonPath, MAX_COMPARED_PLAYERS } from '@/utils/playerComparison'
import { POSITION_SHORT_LABELS } from '@/utils/positions'

import {
  PLAYER_COLUMNS,
  startsSection,
  type PlayerColumn,
  type PlayerColumnKey,
} from '../playersTableColumns'

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
  // Players picked for comparing, in the order they were picked.
  const [picked, setPicked] = useState<Player[]>([])
  const navigate = useNavigate()

  function togglePicked(player: Player) {
    setPicked(
      picked.some((other) => other.id === player.id)
        ? picked.filter((other) => other.id !== player.id)
        : [...picked, player],
    )
  }

  const names = new Intl.ListFormat('en').format(picked.map((player) => player.web_name))

  return (
    <>
      {picked.length > 0 && (
        <div className="players-compare-bar">
          <span>
            {picked.length === 1
              ? `Pick another ${POSITION_SHORT_LABELS[picked[0].element_type]} to compare with ${names}`
              : `Comparing ${names}`}
          </span>
          <BaseButton
            className="players-compare-go"
            disabled={picked.length < 2}
            onClick={() => navigate(comparisonPath(picked.map((player) => player.id)))}
          >
            Compare
          </BaseButton>
          <BaseButton onClick={() => setPicked([])}>Cancel</BaseButton>
        </div>
      )}
      <Table className="players-table" scrollable>
        <thead>
          <tr>
            {PLAYER_COLUMNS.map((column, index) => (
              <TableHeaderCell
                key={column.key}
                align={column.align}
                className={startsSection(index) ? 'players-section-start' : undefined}
                title={column.tooltip}
                sortOrder={sortKey === column.key ? sortOrder : null}
                onSort={() => onSort(column.key)}
              >
                {column.label}
              </TableHeaderCell>
            ))}
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id} className={player.status === 'a' ? undefined : 'unavailable'}>
              {PLAYER_COLUMNS.map((column, index) => (
                <PlayerCell
                  key={column.key}
                  column={column}
                  sectionStart={startsSection(index)}
                  player={player}
                  teamNames={teamNames}
                />
              ))}
              <td>
                <span className="players-table-actions">
                  <FavoriteButton playerId={player.id} playerName={player.web_name} />
                  <CompareButton player={player} picked={picked} onCompare={togglePicked} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

type PlayerCellProps = {
  column: PlayerColumn
  player: Player
  teamNames: Map<number, string>
  /** Draws a line before the cell. */
  sectionStart: boolean
}

function PlayerCell({ column, player, teamNames, sectionStart }: PlayerCellProps) {
  if (column.key === 'web_name') {
    return (
      <td>
        <span className="players-table-name">
          <PlayerThumbnail code={player.code} />
          <span className="players-table-name-text">
            <span className="players-table-name-line">
              <PlayerLink playerId={player.id}>{player.web_name}</PlayerLink>
              <PlayerStatusIcon player={player} />
            </span>
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
    <td
      className={sectionStart ? 'players-section-start' : undefined}
      style={{ textAlign: column.align, color: column.color?.(player) }}
    >
      {column.format ? column.format(player) : column.value(player)}
    </td>
  )
}

type CompareButtonProps = {
  player: Player
  picked: Player[]
  onCompare: (player: Player) => void
}

/**
 * Picks the player for comparing, or unpicks them. Once one is picked, only players in the same
 * position can follow, up to MAX_COMPARED_PLAYERS.
 */
function CompareButton({ player, picked, onCompare }: CompareButtonProps) {
  const isPicked = picked.some((other) => other.id === player.id)
  const isOtherPosition = picked.length > 0 && picked[0].element_type !== player.element_type
  const isFull = picked.length >= MAX_COMPARED_PLAYERS

  let title = 'Compare with other players'
  if (isPicked) title = 'Remove from comparison'
  else if (isOtherPosition) title = 'Only players in the same position can be compared'
  else if (isFull) title = `Up to ${MAX_COMPARED_PLAYERS} players can be compared`
  else if (picked.length > 0) title = 'Add to comparison'

  return (
    <BaseButton
      className={`players-compare-button ${isPicked ? 'active' : ''}`}
      square
      ghost
      disabled={!isPicked && (isOtherPosition || isFull)}
      aria-pressed={isPicked}
      aria-label={`Compare ${player.web_name}`}
      title={title}
      onClick={() => onCompare(player)}
    >
      <Icon icon="compare_arrows" />
    </BaseButton>
  )
}

export default PlayersTable
