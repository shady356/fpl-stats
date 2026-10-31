import { Link } from 'react-router'

import Table from '@/components/ui/Table/Table'
import TableHeaderCell from '@/components/ui/Table/TableHeaderCell'
import TeamBadge from '@/components/ui/TeamBadge/TeamBadge'
import type { PlayerMatch } from '@/types/player'
import { matchResult } from '@/utils/playerHistory'

import BookingCard from './BookingCard.tsx'

type MatchHistoryProps = {
  history: PlayerMatch[]
  /** Short names by understat team_id. */
  teamShortNames: Map<number, string>
}

const COLUMNS: { label: string; title: string; align: 'left' | 'right' }[] = [
  { label: 'GW', title: 'Gameweek', align: 'left' },
  { label: 'Opponent', title: 'Opponent', align: 'left' },
  { label: 'Result', title: 'Result', align: 'left' },
  { label: 'Min', title: 'Minutes played', align: 'right' },
  { label: 'G', title: 'Goals', align: 'right' },
  { label: 'A', title: 'Assists', align: 'right' },
  { label: 'xG', title: 'Expected goals', align: 'right' },
  { label: 'xA', title: 'Expected assists', align: 'right' },
  { label: 'CS', title: 'Clean sheet', align: 'right' },
  { label: 'DC', title: 'Defensive contributions', align: 'right' },
  {
    label: 'Bonus',
    title: 'Bonus points: 3, 2 and 1 for the top three BPS scores in each match',
    align: 'right',
  },
  { label: 'Cards', title: 'Yellow and red cards', align: 'right' },
  { label: 'Price', title: 'Price at the time of the match', align: 'right' },
  { label: 'Pts', title: 'Points', align: 'right' },
]

/**
 * Every match the player was involved in this season, newest first.
 */
export default function MatchHistory({ history, teamShortNames }: MatchHistoryProps) {
  const matches = history.toSorted((a, b) => b.kickoff_time.localeCompare(a.kickoff_time))

  return (
    <Table className="match-history" scrollable>
      <thead>
        <tr>
          {COLUMNS.map((column) => (
            <TableHeaderCell key={column.label} align={column.align} title={column.title}>
              {column.label}
            </TableHeaderCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {matches.map((match) => (
          <tr key={match.fixture} className={match.minutes === 0 ? 'did-not-play' : undefined}>
            <td>{match.round}</td>
            <td>
              <Link to={`/team/${match.opponent_team}`} className="match-history-opponent">
                <TeamBadge teamId={match.opponent_team} size="tiny" />
                {teamShortNames.get(match.opponent_team) ?? '–'} ({match.was_home ? 'H' : 'A'})
              </Link>
            </td>
            <td>{matchResult(match) ?? '–'}</td>
            <td style={{ textAlign: 'right' }}>{match.minutes}</td>
            <td style={{ textAlign: 'right' }}>{match.goals_scored}</td>
            <td style={{ textAlign: 'right' }}>{match.assists}</td>
            <td style={{ textAlign: 'right' }}>{match.expected_goals}</td>
            <td style={{ textAlign: 'right' }}>{match.expected_assists}</td>
            <td style={{ textAlign: 'right' }}>{match.clean_sheets}</td>
            <td style={{ textAlign: 'right' }}>{match.defensive_contribution}</td>
            <td style={{ textAlign: 'right' }}>{match.bonus}</td>
            <td style={{ textAlign: 'right' }}>
              <span className="match-history-cards">
                {Array.from({ length: match.yellow_cards }, (_, index) => (
                  <BookingCard key={`yellow-${index}`} color="yellow" />
                ))}
                {Array.from({ length: match.red_cards }, (_, index) => (
                  <BookingCard key={`red-${index}`} color="red" />
                ))}
              </span>
            </td>
            <td style={{ textAlign: 'right' }}>£{(match.value / 10).toFixed(1)}m</td>
            <td style={{ textAlign: 'right' }} className="match-history-points">
              {match.total_points}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
