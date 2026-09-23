import './App.css'
import { useState } from 'react'
import epl_2026_teams from '../epl-stats/data/epl_2026_teams.json'
import { computeRatings } from '../epl-stats/ratings.js'
import 'material-symbols/rounded.css'

const teams = computeRatings(epl_2026_teams.map((team) => ({ ...team })))

const RATING_COLUMN_KEYS = ['rating_total']

const TEAM_BADGE_CODES = {
  Arsenal: 3,
  'Aston Villa': 7,
  Bournemouth: 91,
  Brentford: 94,
  Brighton: 36,
  Chelsea: 8,
  Coventry: 9,
  'Crystal Pal': 31,
  Everton: 11,
  Fulham: 54,
  Hull: 88,
  Ipswich: 40,
  Leeds: 2,
  Liverpool: 14,
  'Man City': 43,
  'Man United': 1,
  Newcastle: 4,
  'Nott Forest': 17,
  Sunderland: 56,
  Tottenham: 6,
}

function teamBadgeUrl(teamName) {
  const code = TEAM_BADGE_CODES[teamName]
  return code ? `https://resources.premierleague.com/premierleague25/badges-alt/${code}.svg` : null
}

const COLUMNS = [
  { key: 'team_name', label: 'Team', to_fixed: 0, hidden: false, align: 'left' },
  { key: 'games_played', label: 'M', hidden: false, align: 'center' },
  { key: 'rating_total', label: 'Rating', to_fixed: 2, hidden: false, align: 'left' },
  { key: 'rating_attack', label: 'Attack', to_fixed: 2, hidden: false, align: 'right' },
  { key: 'rating_defense', label: 'Defense', to_fixed: 2, hidden: false, align: 'right' },
  { key: 'rating_points', label: 'Points', to_fixed: 2, hidden: false, align: 'right' },
  { key: 'points', label: 'Pts', hidden: false, align: 'right' },
  { key: 'expected_points', label: 'xPts', to_fixed: 2, hidden: false, align: 'right' },
  { key: 'goals', label: 'G', hidden: false, align: 'right' },
  { key: 'xg', label: 'xG', to_fixed: 2, hidden: false, align: 'right' },
  { key: 'ga', label: 'GA', hidden: false, align: 'right' },
  { key: 'xga', label: 'xGA', to_fixed: 2, hidden: false, align: 'right' },
  { key: 'shots', label: 'Shots', hidden: false, align: 'right' },
  { key: 'shots_on_target', label: 'SOT', hidden: false, align: 'right' },
  { key: 'shots_against', label: 'SA', hidden: false, align: 'right' },
  {
    key: 'shots_on_target_against',
    label: 'SOTA',
    hidden: false,
    align: 'right',
  },
  { key: 'aggregated_deep', label: 'Total Deep', hidden: true, align: 'right' },
  { key: 'deep_per_game', label: 'Deep', to_fixed: 1, hidden: false, align: 'right' },
  { key: 'aggregated_ppda', label: 'Total PPDA', to_fixed: 2, hidden: true, align: 'right' },
  { key: 'ppda_per_game', label: 'PPDA', to_fixed: 2, hidden: false, align: 'right' },
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
  let sortedTeams = [...teams].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal) * direction
    }
    return (aVal - bVal) * direction
  })

  sortedTeams = sortedTeams.map((team) => {
    const roundedTeam = { ...team }
    COLUMNS.forEach((col) => {
      if (col.to_fixed !== undefined && typeof team[col.key] === 'number') {
        roundedTeam[col.key] = team[col.key].toFixed(col.to_fixed)
      }
    })
    return roundedTeam
  })

  function sort(column) {
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
            {COLUMNS.map((col) =>
              col.hidden ? null : (
                <th key={col.key} style={{ textAlign: col.align }}>
                  <button
                    className={`sort-button ${sortKey === col.key ? 'sort-button-selected' : ''}`}
                    onClick={() => sort(col.key)}
                  >
                    {col.label}
                    {sortKey === col.key &&
                      (sortOrder === 'asc' ? (
                        <span className="material-symbols-rounded">arrow_upward</span>
                      ) : (
                        <span className="material-symbols-rounded">arrow_downward</span>
                      ))}
                  </button>
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {sortedTeams.map((team) => (
            <tr key={team.team_id}>
              {COLUMNS.map((col) =>
                col.hidden ? null : col.key === 'team_name' ? (
                  <td key={col.key}>
                    <div
                      className="team-name"
                      style={{
                        background: `linear-gradient(90deg, ${team.rating_color} 0%, rgba(0, 0, 0, 0) 100%)`,
                      }}
                    >
                      {teamBadgeUrl(team.team_name) && (
                        <img className="team-badge" src={teamBadgeUrl(team.team_name)} alt="" />
                      )}
                      {team.team_name}
                    </div>
                  </td>
                ) : RATING_COLUMN_KEYS.includes(col.key) ? (
                  <td key={col.key} title={`${col.label}: ${team[col.key]}`}>
                    <StarRating rating={team[`${col.key}`]} />
                  </td>
                ) : (
                  <td key={col.key} style={{ textAlign: col.align }}>
                    {team[col.key]}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
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

export default App
