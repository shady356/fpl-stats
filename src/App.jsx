import './App.css'
import { useState } from 'react'
import epl_2026_teams from '../epl-stats/data/epl_2026_teams.json'
import { computeRatings } from '../epl-stats/ratings.js'

const teams = computeRatings(epl_2026_teams.map((team) => ({ ...team })))

const RATING_COLUMN_KEYS = ['rating_total', 'rating_attack', 'rating_defense', 'rating_points']

const COLUMNS = [
  { key: 'team_name', label: 'team', to_fixed: 0 },
  { key: 'games_played', label: 'M' },
  { key: 'rating_total', label: 'rating', to_fixed: 2 },
  { key: 'rating_attack', label: 'atk r', to_fixed: 2 },
  { key: 'rating_defense', label: 'def r', to_fixed: 2 },
  { key: 'rating_points', label: 'pts r', to_fixed: 2 },
  { key: 'points', label: 'P', },
  { key: 'expected_points', label: 'xPTS', to_fixed: 2 },
  { key: 'goals', label: 'G', },
  { key: 'xg', label: 'xG', to_fixed: 2 },
  { key: 'ga', label: 'GA', },
  { key: 'xga', label: 'xGA', to_fixed: 2 },
  { key: 'shots', label: 'shots', },
  { key: 'shots_on_target', label: 'shots t', },
  { key: 'shots_against', label: 'shots a', },
  { key: 'shots_on_target_against', label: 'shots t a', },
  { key: 'aggregated_deep', label: 'total deep', },
  { key: 'deep_per_game', label: 'deep avg', to_fixed: 1 },
  { key: 'aggregated_ppda', label: 'total ppda', to_fixed: 2 },
  { key: 'ppda_per_game', label: 'ppda avg', to_fixed: 2 },
]

function App() {
  return (
    <div>
      <h1>Premier League Matches</h1>
      <Table />
    </div>
  )
}

function Table() {
  const [sortKey, setSortKey] = useState('points')
  const [sortOrder, setSortOrder] = useState('desc')

  const direction = sortOrder === 'asc' ? 1 : -1
  const sortedTeams = [...teams].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal) * direction
    }
    return (aVal - bVal) * direction
  })

  const roundedSortedTeams = sortedTeams.map((team) => {
    const roundedTeam = { ...team }
    COLUMNS.forEach((col) => {
      if (col.to_fixed !== undefined && typeof team[col.key] === 'number') {
        roundedTeam[col.key] = team[col.key].toFixed(col.to_fixed)
      }
    })
    return roundedTeam
  })

  function sort (column) {
    if (sortKey === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(column)
      setSortOrder('desc')
    }
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} className={col.key === 'team_name' ? 'left-align' : ''}>
                <button className={`sort-button ${sortKey === col.key ? 'sort-button-selected' : ''}`} onClick={() => sort(col.key)}>
                  {col.label} 
{sortKey === col.key && (sortOrder === 'asc' ? ' ⬆️' : ' ⬇️')}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roundedSortedTeams.map((team) => (
            <tr key={team.team_id}>
              {COLUMNS.map((col) => (
                col.key === 'team_name'
                  ? <td key={col.key} className="left-align" >
                    <div style={{ backgroundColor: team.rating_color }} className="team-name">{team.team_name}</div>
                  </td>
                  : RATING_COLUMN_KEYS.includes(col.key)
                    ? <td key={col.key} title={`${col.label}: ${team[col.key]}`}><StarRating rating={team[`${col.key}_rounded`]} /></td>
                    : <td key={col.key}>{team[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function StarRating({ rating }) {
  const stars = new Array(5).fill(0)

  return (
    
    <div className="star-container">
      {stars.map((_, i) => 
        i < rating
          ? <span key={i} className="star">⭐</span>
          : <span key={i} className="gray-star">⭐</span>
      )}
    </div>
  )
}

export default App