import './App.css'
import { useState } from 'react'
import epl_2026_teams from '../epl-stats/data/epl_2026_teams.json'
import { computeRatings } from '../epl-stats/ratings.js'
import { computePlayStyles } from '../epl-stats/playStyles.js'
import 'material-symbols/rounded.css'
import plLogoSVG from './assets/pl_logo.svg'
import { teamBadgeUrl } from './teamBadges.js'
import { COLUMNS, RATING_COLUMN_KEYS } from './teamStatsTableColumns.js'

const teams = computePlayStyles(computeRatings(epl_2026_teams.map((team) => ({ ...team }))))

function App() {
  const [showTeamRatingColor, setShowTeamRatingColor] = useState(false)
  return (
    <div>
      <Header
        showTeamRatingColor={showTeamRatingColor}
        setShowTeamRatingColor={setShowTeamRatingColor}
      />
      <Table showTeamRatingColor={showTeamRatingColor} />
    </div>
  )
}

function sortTeams(teamsToSort, sortKey, sortOrder) {
  const direction = sortOrder === 'asc' ? 1 : -1
  return [...teamsToSort].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal) * direction
    }
    return (aVal - bVal) * direction
  })
}

function formatTeamValues(team) {
  const formatted = { ...team }
  COLUMNS.forEach((col) => {
    if (col.to_fixed !== undefined && typeof team[col.key] === 'number') {
      formatted[col.key] = team[col.key].toFixed(col.to_fixed)
    }
  })
  return formatted
}

function Table({ showTeamRatingColor }) {
  const [sortKey, setSortKey] = useState('points')
  const [sortOrder, setSortOrder] = useState('desc')

  function sort(column) {
    if (sortKey === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(column)
      setSortOrder('desc')
    }
  }

  const sortedTeams = sortTeams(teams, sortKey, sortOrder).map(formatTeamValues)
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
            showTeamRatingColor={showTeamRatingColor}
          />
        ))}
      </tbody>
    </table>
  )
}

function TableHeaderCell({ column, sortOrder, onSort }) {
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

function TableRow({ team, columns, showTeamRatingColor }) {
  return (
    <tr>
      {columns.map((col) => (
        <TableCell
          key={col.key}
          column={col}
          team={team}
          showTeamRatingColor={showTeamRatingColor}
        />
      ))}
    </tr>
  )
}

function TableCell({ column, team, showTeamRatingColor }) {
  if (column.key === 'team_name') {
    return (
      <td>
        <div
          className="team-name"
          style={{
            background: showTeamRatingColor
              ? `linear-gradient(90deg, ${team.rating_color} 0%, rgba(0, 0, 0, 0) 100%)`
              : 'none',
          }}
        >
          {teamBadgeUrl(team.team_name) && (
            <img className="team-badge" src={teamBadgeUrl(team.team_name)} alt="" />
          )}
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

  if (RATING_COLUMN_KEYS.includes(column.key)) {
    return (
      <td title={`${column.label}: ${team[column.key]}`}>
        <StarRating rating={team[column.key]} />
      </td>
    )
  }

  return <td style={{ textAlign: column.align }}>{team[column.key]}</td>
}

function StarRating({ rating }) {
  const stars = new Array(5).fill(0)
  const fullStars = Math.floor(rating)
  const isHalfStar = rating % 1 >= 0.5

  return (
    <div className="star-container">
      {stars.map((_, i) => (
        <span
          key={i}
          className={`material-symbols-rounded filled${i < fullStars || (isHalfStar && i === fullStars) ? ' colored' : ''}`}
        >
          {isHalfStar && i === fullStars ? 'star_half' : 'star'}
        </span>
      ))}
    </div>
  )
}

function Header({ showTeamRatingColor, setShowTeamRatingColor }) {
  return (
    <header>
      <img className="pl-logo" src={plLogoSVG} alt="" />
      <label>
        <input
          type="checkbox"
          checked={showTeamRatingColor}
          onChange={() => setShowTeamRatingColor((prev) => !prev)}
        />
        FDR colors
      </label>
    </header>
  )
}

export default App
