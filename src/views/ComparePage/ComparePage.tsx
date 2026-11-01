import { Suspense } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import PlayerLink from '@/components/PlayerLink/PlayerLink'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import PlayerPhoto from '@/components/ui/PlayerPhoto/PlayerPhoto'
import PositionTag from '@/components/ui/PositionTag/PositionTag'
import { usePlayers } from '@/hooks/usePlayers'
import type { Player } from '@/types/player'
import type { Team } from '@/types/team'
import {
  bestPlayerIds,
  comparisonPath,
  comparisonStats,
  MAX_COMPARED_PLAYERS,
  parseComparedIds,
} from '@/utils/playerComparison'
import { POSITION_SHORT_LABELS } from '@/utils/positions'

import './ComparePage.css'

type ComparePageProps = {
  teams: Team[]
}

function ComparePage({ teams }: ComparePageProps) {
  return (
    <div className="compare-page">
      <Suspense fallback={<p>Loading players…</p>}>
        <Comparison teams={teams} />
      </Suspense>
    </div>
  )
}

/**
 * Up to three players side by side, picked by the `ids` URL param so a comparison can be shared.
 */
function Comparison({ teams }: ComparePageProps) {
  const players = usePlayers()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  if (players.length === 0) return <p>Could not load players.</p>

  const compared = parseComparedIds(params.get('ids'))
    .map((id) => players.find((player) => player.id === id))
    .filter((player) => player !== undefined)
  const position = compared[0]?.element_type
  const teamShortNames = new Map(teams.map((team) => [team.team_id, team.team_name_short]))

  // Built by hand rather than with setSearchParams, which would encode the commas.
  function setIds(ids: number[]) {
    navigate(comparisonPath(ids), { replace: true })
  }

  const ids = compared.map((player) => player.id)
  // Only players in the same position can be compared, so the picker offers the first one's.
  const choices = players
    .filter((player) => position === undefined || player.element_type === position)
    .filter((player) => !ids.includes(player.id))
    .toSorted((a, b) => b.total_points - a.total_points)

  let hint: string | undefined
  if (compared.length === 0) hint = 'Choose up to three players in the same position to compare.'
  else if (compared.length === 1)
    hint = `Choose another ${POSITION_SHORT_LABELS[position!]} to compare with.`

  return (
    <>
      <div className="compare-toolbar">
        <h1>Compare players</h1>
        {compared.length < MAX_COMPARED_PLAYERS && (
          <select
            className="compare-picker"
            aria-label="Add player"
            value=""
            onChange={(e) => setIds([...ids, Number(e.target.value)])}
          >
            <option value="" disabled>
              Add player
            </option>
            {choices.map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.web_name} ({teamShortNames.get(choice.team) ?? '–'})
              </option>
            ))}
          </select>
        )}
      </div>

      {compared.some((player) => player.element_type !== position) ? (
        <p className="compare-hint">Only players in the same position can be compared.</p>
      ) : (
        compared.length > 0 && (
          <CompareStats
            players={compared}
            teamShortNames={teamShortNames}
            onRemove={(id) => setIds(ids.filter((other) => other !== id))}
          />
        )
      )}

      {hint && <p className="compare-hint">{hint}</p>}
    </>
  )
}

type CompareStatsProps = {
  players: Player[]
  teamShortNames: Map<number, string>
  onRemove: (playerId: number) => void
}

/**
 * The season stats with a column per player and the best value in each row highlighted.
 */
function CompareStats({ players, teamShortNames, onRemove }: CompareStatsProps) {
  return (
    <table className="compare-stats">
      <thead>
        <tr>
          <td />
          {players.map((player) => (
            <th key={player.id} scope="col">
              <div className="compare-player">
                <BaseButton
                  className="compare-remove"
                  square
                  ghost
                  aria-label={`Remove ${player.web_name}`}
                  title="Remove from comparison"
                  onClick={() => onRemove(player.id)}
                >
                  <Icon icon="close" />
                </BaseButton>
                <PlayerPhoto code={player.code} />
                <PlayerLink playerId={player.id} className="compare-player-name">
                  <span title={`${player.first_name} ${player.second_name}`}>
                    {player.web_name}
                  </span>
                </PlayerLink>
                <span className="compare-player-details">
                  {teamShortNames.get(player.team) ?? '–'}
                  <PositionTag position={player.element_type} />
                </span>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {comparisonStats(players[0].element_type).map((stat) => {
          const best = bestPlayerIds(stat, players)
          return (
            <tr key={stat.key}>
              <th scope="row" title={stat.tooltip}>
                {stat.label}
              </th>
              {players.map((player) => (
                <td key={player.id} className={best.includes(player.id) ? 'best' : undefined}>
                  <span className="compare-value">
                    {stat.format ? stat.format(player) : stat.value(player)}
                  </span>
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ComparePage
