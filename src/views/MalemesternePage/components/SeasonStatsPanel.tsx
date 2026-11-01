import type { ReactNode } from 'react'

import PlayerLink from '@/components/PlayerLink/PlayerLink'
import PlayerThumbnail from '@/components/ui/PlayerThumbnail/PlayerThumbnail.tsx'
import { useEntryHistory, useSeasonGameweeks } from '@/hooks/useMyTeam'
import { usePlayers } from '@/hooks/usePlayers'
import type { Entry } from '@/types/myTeam'
import { computeSeasonStats } from '@/utils/seasonStats.ts'

import './SeasonStatsPanel.css'

function formatMoney(tenths: number): string {
  return `£${(tenths / 10).toFixed(1)}m`
}

function formatChange(tenths: number): string {
  return `${tenths >= 0 ? '+' : '-'}${formatMoney(Math.abs(tenths))}`
}

/**
 * Side panel with the manager and fun season stats.
 */
export default function SeasonStatsPanel({ entry }: { entry: Entry }) {
  const players = usePlayers()
  const history = useEntryHistory(entry.id)
  const gameweeks = useSeasonGameweeks(
    entry.id,
    history?.current.map((result) => result.event) ?? [],
  )

  if (!history) {
    return (
      <aside className="season-stats">
        <p>Could not load season stats.</p>
      </aside>
    )
  }

  const stats = computeSeasonStats(history, gameweeks, players)

  return (
    <aside className="season-stats">
      <div className="season-stats-card">
        <h2>
          {entry.player_first_name} {entry.player_last_name}
        </h2>
        <span className="season-stats-subtitle">
          {entry.summary_overall_points} pts · OR{' '}
          {entry.summary_overall_rank?.toLocaleString() ?? '–'}
        </span>
      </div>

      <div className="season-stats-card">
        <h3>Top points for you</h3>
        <ol className="season-stats-players">
          {stats.topPlayers.map(({ element, player, points }) => (
            <li key={element}>
              {player && <PlayerThumbnail code={player.code} size="large" />}
              <span className="season-stats-player-name">
                {player ? (
                  <PlayerLink playerId={player.id}>{player.web_name}</PlayerLink>
                ) : (
                  'Unknown'
                )}
              </span>
              <span className="season-stats-player-points">{points} pts</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="season-stats-card">
        <h3>Season stats</h3>
        <div className="season-stats-grid">
          <StatTile
            label="Best GW rank"
            value={stats.bestRank?.rank?.toLocaleString() ?? '–'}
            detail={stats.bestRank && `GW ${stats.bestRank.event}`}
          />
          <StatTile
            label="Best GW score"
            value={stats.bestScore?.points ?? '–'}
            detail={stats.bestScore && `GW ${stats.bestScore.event}`}
          />
          <StatTile
            label="Bench Boost"
            value={stats.benchBoost ? `+${stats.benchBoost.points}` : '–'}
            detail={stats.benchBoost ? `GW ${stats.benchBoost.gameweek}` : 'Not played'}
          />
          <StatTile label="Points on bench" value={stats.benchPoints} detail="Wasted this season" />
          <StatTile
            label="Team value"
            value={formatMoney(stats.teamValue)}
            detail={`${formatChange(stats.teamValueChange)} · ${formatMoney(stats.bank)} ITB`}
          />
          <StatTile label="Captain points" value={stats.captainPoints} />
          <StatTile
            label="Transfers"
            value={stats.transfers}
            detail={stats.hitsCost > 0 ? `-${stats.hitsCost} pts in hits` : 'No hits'}
          />
        </div>
      </div>
    </aside>
  )
}

type StatTileProps = {
  label: string
  value: ReactNode
  detail?: ReactNode
}

function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <div className="season-stats-tile">
      <span className="season-stats-label">{label}</span>
      <span className="season-stats-value">{value}</span>
      {detail && <span className="season-stats-detail">{detail}</span>}
    </div>
  )
}
