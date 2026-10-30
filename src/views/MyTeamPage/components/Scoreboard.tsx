import type { Gameweek } from '@/types/gameweek'
import type { EntryPicks } from '@/types/myTeam'

import './Scoreboard.css'

const CHIP_NAMES: Record<string, string> = {
  bboost: 'Bench Boost',
  '3xc': 'Triple Captain',
  freehit: 'Free Hit',
  wildcard: 'Wildcard',
  manager: 'Assistant Manager',
}

type ScoreboardProps = {
  entryPicks: EntryPicks
  /** undefined if bootstrap-static failed to load. */
  gameweek: Gameweek | undefined
}

/**
 * The gameweek's points between the average and highest scores, with rank and transfers below.
 */
export default function Scoreboard({ entryPicks, gameweek }: ScoreboardProps) {
  const { entry_history: history, active_chip: chip } = entryPicks

  return (
    <section className="scoreboard">
      <div className="scoreboard-scores">
        <div className="scoreboard-score">
          <span className="scoreboard-value">{gameweek?.average_entry_score ?? '–'}</span>
          <span className="scoreboard-label">Average Points</span>
        </div>
        <div className="scoreboard-score scoreboard-score-main">
          <span className="scoreboard-label">
            {gameweek?.finished ? 'Final Points' : 'Latest Points'}
          </span>
          <span className="scoreboard-value">{history.points}</span>
        </div>
        <div className="scoreboard-score">
          <span className="scoreboard-value">{gameweek?.highest_score ?? '–'}</span>
          <span className="scoreboard-label">Highest Points</span>
        </div>
      </div>
      <dl className="scoreboard-details">
        <div>
          <dt>GW Rank</dt>
          <dd>{history.rank?.toLocaleString() ?? '–'}</dd>
        </div>
        <div>
          <dt>Transfers</dt>
          <dd>
            {history.event_transfers}
            {history.event_transfers_cost > 0 && ` (-${history.event_transfers_cost} pts)`}
          </dd>
        </div>
      </dl>
      {chip && <p className="scoreboard-chip">{CHIP_NAMES[chip] ?? chip} played</p>}
    </section>
  )
}
