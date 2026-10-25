import { useState } from 'react'

import StarRating from '@/components/ui/StarRating/StarRating.tsx'
import Table from '@/components/ui/Table/Table.tsx'
import TableHeaderCell from '@/components/ui/Table/TableHeaderCell.tsx'
import type { SortOrder } from '@/components/ui/Table/TableHeaderCell.tsx'
import TeamName from '@/components/ui/TeamName/TeamName.tsx'
import type { FormMatch, Team } from '@/types/team.ts'
import { formPoints } from '@/utils/form.ts'
import { RATING_COLORS } from '@/utils/ratings.ts'

import { COLUMNS, isRatingColumnKey } from '../teamStatsTableColumns.ts'
import type { Column, ColumnKey } from '../teamStatsTableColumns.ts'

export type TeamRatingColor = 'none' | 'total' | 'attack' | 'defense'

function sortTeams(teamsToSort: Team[], sortKey: ColumnKey, sortOrder: SortOrder): Team[] {
  const direction = sortOrder === 'asc' ? 1 : -1
  return [...teamsToSort].sort((a, b) => {
    const aVal = sortKey === 'form' ? formPoints(a.form) : a[sortKey]
    const bVal = sortKey === 'form' ? formPoints(b.form) : b[sortKey]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * direction
    }
    return String(aVal).localeCompare(String(bVal)) * direction
  })
}

function formatValue(value: Team[Exclude<ColumnKey, 'form'>], column: Column): string | number {
  if (column.to_fixed !== undefined && typeof value === 'number') {
    return value.toFixed(column.to_fixed)
  }
  return value
}

/**
 * Win, draw and loss colors, matching rating levels 2-4.
 */
const FORM_COLORS: Record<FormMatch['result'], string> = {
  W: RATING_COLORS[2],
  D: RATING_COLORS[3],
  L: RATING_COLORS[4],
}

type TeamStatsTableProps = {
  teams: Team[]
  teamRatingColor: TeamRatingColor
}

function TeamStatsTable({ teams, teamRatingColor }: TeamStatsTableProps) {
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
    <Table>
      <thead>
        <tr>
          {visibleColumns.map((col) => (
            <TableHeaderCell
              key={col.key}
              align={col.align}
              title={col.tooltip}
              sortOrder={sortKey === col.key ? sortOrder : null}
              onSort={() => sort(col.key)}
            >
              {col.label}
            </TableHeaderCell>
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
    </Table>
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
    return (
      <td>
        <TeamName team={team} color={teamColor} />
      </td>
    )
  }

  if (column.key === 'form') {
    return <FormCell form={team.form} />
  }

  if (isRatingColumnKey(column.key)) {
    return (
      <td title={`${column.label}: ${formatValue(team[column.key], column)}`}>
        <StarRating size="small" score={team[column.key]} />
      </td>
    )
  }

  return (
    <td className={column.numeric ? 'numeric' : undefined} style={{ textAlign: column.align }}>
      {formatValue(team[column.key], column)}
    </td>
  )
}

type FormCellProps = {
  form: FormMatch[]
}

function FormCell({ form }: FormCellProps) {
  return (
    <td>
      <div className="form">
        {form.map((match) => (
          <span
            key={match.match_id}
            className="form-result"
            style={{ background: FORM_COLORS[match.result] }}
            title={`${match.home_team} ${match.home_goals} - ${match.away_goals} ${match.away_team}`}
          >
            {match.result}
          </span>
        ))}
      </div>
    </td>
  )
}

export default TeamStatsTable
