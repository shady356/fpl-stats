import { Suspense } from 'react'
import { Link } from 'react-router'

import FavoriteButton from '@/components/FavoriteButton/FavoriteButton'
import BarChart from '@/components/ui/Chart/BarChart'
import LineChart from '@/components/ui/Chart/LineChart'
import PlayerPhoto from '@/components/ui/PlayerPhoto/PlayerPhoto'
import TeamBadge from '@/components/ui/TeamBadge/TeamBadge'
import { usePlayerSummary } from '@/hooks/usePlayerSummary'
import type { Player } from '@/types/player'
import type { Team } from '@/types/team'
import { formColor } from '@/utils/playerForm'
import { playerGameweeks, type PlayerGameweek } from '@/utils/playerHistory'
import { POSITION_SHORT_LABELS } from '@/utils/positions'
import { teamFullName } from '@/utils/teamFullNames'

import './PlayerPage.css'

import MatchHistory from './components/MatchHistory'
import PlayerSeasonStats from './components/PlayerSeasonStats'

const STATUS_LABELS: Record<string, string> = {
  d: 'Doubtful',
  i: 'Injured',
  s: 'Suspended',
  u: 'Unavailable',
  n: 'Not eligible',
}

type PlayerPageProps = {
  player: Player
  /** All teams, for looking up the player's team and opponents. */
  teams: Team[]
}

function formatPrice(tenths: number): string {
  return `£${(tenths / 10).toFixed(1)}m`
}

function PlayerPage({ player, teams }: PlayerPageProps) {
  const team = teams.find((team) => team.team_id === player.team)
  const status = STATUS_LABELS[player.status]

  return (
    <div className="player-page">
      <section className="player-header">
        <PlayerPhoto code={player.code} position={player.element_type} size="large" />
        <div className="player-header-name">
          <div className="player-header-form" title="Average points over the last 30 days">
            <span
              className="player-header-form-value"
              style={{ color: formColor(Number(player.form)) }}
            >
              {player.form}
            </span>
            <span className="player-header-form-label">Form</span>
          </div>
          <div className="player-header-title">
            <h1>
              {player.first_name} {player.second_name}
            </h1>
            <FavoriteButton
              playerId={player.id}
              playerName={`${player.first_name} ${player.second_name}`}
            />
          </div>
          <div className="player-header-details">
            <span>{POSITION_SHORT_LABELS[player.element_type]}</span>
            <span>{formatPrice(player.now_cost)}</span>
            {status && <span className="player-header-status">{status}</span>}
          </div>
        </div>
        {team && (
          <Link
            to={`/team/${team.team_id}`}
            className="player-header-team"
            title={teamFullName(team.team_name)}
          >
            <TeamBadge teamId={team.team_id} size="medium" />
            {team.team_name_short}
          </Link>
        )}
      </section>

      <div className="player-body">
        <PlayerSeasonStats player={player} />
        <Suspense fallback={<p>Loading season…</p>}>
          <PlayerSeason player={player} teams={teams} />
        </Suspense>
      </div>
    </div>
  )
}

function PlayerSeason({ player, teams }: PlayerPageProps) {
  const summary = usePlayerSummary(player.id)

  if (!summary) return <p>Could not load the player's season.</p>
  if (summary.history.length === 0) return <p>No matches played yet this season.</p>

  const teamShortNames = new Map(teams.map((team) => [team.team_id, team.team_name_short]))
  const gameweeks = playerGameweeks(summary.history)
  const opponents = (gameweek: PlayerGameweek) =>
    gameweek.matches
      .map(
        (match) =>
          `${teamShortNames.get(match.opponent_team) ?? '–'} (${match.was_home ? 'H' : 'A'})`,
      )
      .join(', ')

  return (
    <div className="player-season">
      <section className="player-card">
        <h2>Matches</h2>
        <MatchHistory history={summary.history} teamShortNames={teamShortNames} />
      </section>

      <section className="player-card">
        <h2>Points per gameweek</h2>
        <BarChart
          aria-label={`${player.web_name}'s points per gameweek`}
          data={gameweeks.map((gameweek) => ({
            key: gameweek.gameweek,
            label: String(gameweek.gameweek),
            value: gameweek.points,
            title: `GW ${gameweek.gameweek}: ${gameweek.points} pts`,
            details: [opponents(gameweek), `${gameweek.minutes} min`],
          }))}
        />
      </section>

      <section className="player-card">
        <h2>Price</h2>
        <LineChart
          aria-label={`${player.web_name}'s price per gameweek`}
          formatTick={(tenths) => formatPrice(tenths)}
          data={gameweeks.map((gameweek, index) => {
            const change = index > 0 ? gameweek.price - gameweeks[index - 1].price : 0
            return {
              key: gameweek.gameweek,
              label: String(gameweek.gameweek),
              value: gameweek.price,
              title: `GW ${gameweek.gameweek}: ${formatPrice(gameweek.price)}`,
              details:
                change === 0
                  ? undefined
                  : [`${change > 0 ? '+' : '-'}${formatPrice(Math.abs(change))} from last GW`],
            }
          })}
        />
      </section>
    </div>
  )
}

export default PlayerPage
