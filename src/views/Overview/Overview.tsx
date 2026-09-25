import { useState } from 'react'

import epl_2026_teams from '@data/epl_2026_teams.json'
import StarRating from '@/components/ui/StarRating.tsx'
import type { Team } from '@/types/team.ts'
import { computePlayStyles } from '@/utils/playStyles.ts'
import { computeRatings } from '@/utils/ratings.ts'
import { teamBadgeUrl } from '@/utils/teamBadges.ts'

import { COLUMNS, isRatingColumnKey } from './teamStatsTableColumns.ts'
import type { Column, ColumnKey } from './teamStatsTableColumns.ts'

type SortOrder = 'asc' | 'desc'
type TeamRatingColor = 'none' | 'total' | 'attack' | 'defense'

const teams: Team[] = computePlayStyles(computeRatings(epl_2026_teams))

function App() {
  const [teamRatingColor, setTeamRatingColor] = useState<TeamRatingColor>('none')
  return (
    <>
      <TableFilters setTeamRatingColor={setTeamRatingColor} />
      <Table teamRatingColor={teamRatingColor} />
    </>
  )
}

function sortTeams(teamsToSort: Team[], sortKey: ColumnKey, sortOrder: SortOrder): Team[] {
  const direction = sortOrder === 'asc' ? 1 : -1
  return [...teamsToSort].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * direction
    }
    return String(aVal).localeCompare(String(bVal)) * direction
  })
}

function formatValue(value: Team[ColumnKey], column: Column): string | number {
  if (column.to_fixed !== undefined && typeof value === 'number') {
    return value.toFixed(column.to_fixed)
  }
  return value
}

type TableProps = {
  teamRatingColor: TeamRatingColor
}

function Table({ teamRatingColor }: TableProps) {
  const [sortKey, setSortKey] = useState<ColumnKey>('points')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  function sort(column: ColumnKey) {
    if (sortKey === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(column)
      setSortOrder('desc')
    }
  }

  const sortedTeams = sortTeams(teams, sortKey, sortOrder)
  const visibleColumns = COLUMNS.filter((col) => !col.hidden)

  return (
    <table>
      <thead>
        <tr>
          {visibleColumns.map((col) => (
            <TableHeaderCell
              key={col.key}
              column={col}
              sortOrder={sortKey === col.key ? sortOrder : null}
              onSort={sort}
            />
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedTeams.map((team) => (
          <TableRow
            key={team.team_id}
            team={team}
            columns={visibleColumns}
            teamRatingColor={teamRatingColor}
          />
        ))}
      </tbody>
    </table>
  )
}

type TableHeaderCellProps = {
  column: Column
  sortOrder: SortOrder | null
  onSort: (key: ColumnKey) => void
}

function TableHeaderCell({ column, sortOrder, onSort }: TableHeaderCellProps) {
  return (
    <th style={{ textAlign: column.align }} title={column.tooltip}>
      <button
        className={`sort-button ${sortOrder ? 'sort-button-selected' : ''}`}
        onClick={() => onSort(column.key)}
      >
        {column.label}
        {sortOrder && (
          <span className="material-symbols-rounded">
            {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
          </span>
        )}
      </button>
    </th>
  )
}

type TableRowProps = {
  team: Team
  columns: Column[]
  teamRatingColor: TeamRatingColor
}

function TableRow({ team, columns, teamRatingColor }: TableRowProps) {
  return (
    <tr>
      {columns.map((col) => (
        <TableCell key={col.key} column={col} team={team} teamRatingColor={teamRatingColor} />
      ))}
    </tr>
  )
}

function getTeamRatingColors(team: Team, teamRatingColor: TeamRatingColor): string {
  switch (teamRatingColor) {
    case 'attack':
      return team.rating_attack_color
    case 'defense':
      return team.rating_defense_color
    case 'total':
      return team.rating_total_color
    default:
      return 'transparent'
  }
}

type TableCellProps = {
  column: Column
  team: Team
  teamRatingColor: TeamRatingColor
}

function TableCell({ column, team, teamRatingColor }: TableCellProps) {
  const teamColor = getTeamRatingColors(team, teamRatingColor)

  if (column.key === 'team_name') {
    const badgeUrl = teamBadgeUrl(team.team_name)
    return (
      <td>
        <div
          className="team-name"
          style={{
            background: `linear-gradient(90deg, ${teamColor} 0%, rgba(0, 0, 0, 0) 100%)`,
          }}
        >
          {badgeUrl && <img className="team-badge" src={badgeUrl} alt="" />}
          {team.team_name}
        </div>
      </td>
    )
  }

  if (column.key === 'play_style') {
    return (
      <td className="play-style" style={{ textAlign: column.align }} title={team.play_style_detail}>
        {team.play_style}
      </td>
    )
  }

  if (isRatingColumnKey(column.key)) {
    return (
      <td title={`${column.label}: ${formatValue(team[column.key], column)}`}>
        <StarRating score={team[column.key]} />
      </td>
    )
  }

  return <td style={{ textAlign: column.align }}>{formatValue(team[column.key], column)}</td>
}

type TableFiltersProps = {
  setTeamRatingColor: (color: TeamRatingColor) => void
}

function TableFilters({ setTeamRatingColor }: TableFiltersProps) {
  return (
    <label>
      FDR colors
      <select
        name="fdr-colors"
        id=""
        onChange={(e) => setTeamRatingColor(e.target.value as TeamRatingColor)}
      >
        <option value="none">None</option>
        <option value="total">Total</option>
        <option value="attack">Attack</option>
        <option value="defense">Defense</option>
      </select>
    </label>
  )
}

export default App
