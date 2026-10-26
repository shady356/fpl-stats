import { useState } from 'react'

import BaseSegmentedButton from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButton'
import BaseSegmentedButtons from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButtons'
import PlayerPhoto from '@/components/ui/PlayerPhoto/PlayerPhoto'
import { usePlayers } from '@/hooks/usePlayers'
import type { Player, PlayerPosition } from '@/types/player'
import type { Team } from '@/types/team'

import './TopList.css'

const POSITION_SHORT_LABELS: Record<PlayerPosition, string> = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
}

/** Players shown in the top list. */
const TOP_LIST_COUNT = 5

type TopListStat = {
  label: string
  title: string
  value: (player: Player) => number
  render: (player: Player) => string | number
}

const TOP_LIST_STATS: TopListStat[] = [
  {
    label: 'Points',
    title: 'Total points this season',
    value: (player) => player.total_points,
    render: (player) => player.total_points,
  },
  {
    label: 'Form',
    title: 'Average points per game over the last 30 days',
    value: (player) => Number(player.form),
    render: (player) => player.form,
  },
  {
    label: 'Goals',
    title: 'Goals scored',
    value: (player) => player.goals_scored,
    render: (player) => player.goals_scored,
  },
  {
    label: 'Assists',
    title: 'Assists',
    value: (player) => player.assists,
    render: (player) => player.assists,
  },
  {
    label: 'Def con',
    title: 'Defensive contributions',
    value: (player) => player.defensive_contribution,
    render: (player) => player.defensive_contribution,
  },
  {
    label: 'Minutes',
    title: 'Minutes played',
    value: (player) => player.minutes,
    render: (player) => player.minutes,
  },
  {
    label: 'Selected',
    title: 'Percentage of FPL managers who own the player',
    value: (player) => Number(player.selected_by_percent),
    render: (player) => `${player.selected_by_percent}%`,
  },
]

/**
 * The team's available players ranked by the selected stat.
 */
export default function TopList({ team }: { team: Team }) {
  const [statIndex, setStatIndex] = useState(0)
  const stat = TOP_LIST_STATS[statIndex]
  const players = usePlayers()
    .filter((player) => player.team === team.team_id && player.status === 'a')
    .filter((player) => stat.value(player) > 0)
    .toSorted((a, b) => stat.value(b) - stat.value(a))
    .slice(0, TOP_LIST_COUNT)
  const [leader, ...rest] = players

  return (
    <section className="card top-list">
      <div className="card-header">
        <h2 id="top-list-label">Top list</h2>
        <BaseSegmentedButtons className="top-list-stats" aria-labelledby="top-list-label">
          {TOP_LIST_STATS.map(({ label, title }, index) => (
            <BaseSegmentedButton
              key={label}
              title={title}
              selected={statIndex === index}
              onClick={() => setStatIndex(index)}
            >
              {label}
            </BaseSegmentedButton>
          ))}
        </BaseSegmentedButtons>
      </div>

      {leader === undefined ? (
        <p>No players yet.</p>
      ) : (
        <>
          <div className="top-list-leader">
            <PlayerPhoto code={leader.code} size="large" position={leader.element_type} />
            <div className="top-list-name">
              <span className="top-list-rank">#1</span>
              <span className="top-list-leader-name">{leader.web_name}</span>
              <PlayerDetails player={leader} />
            </div>
            <span className="top-list-score top-list-leader-score" title={stat.title}>
              {stat.render(leader)}
            </span>
          </div>

          {rest.length > 0 && (
            <ol className="top-list-players" start={2}>
              {rest.map((player, index) => (
                <li key={player.id} className="top-list-player">
                  <span className="top-list-rank">{index + 2}</span>
                  <PlayerPhoto code={player.code} size="small" position={player.element_type} />
                  <div className="top-list-name">
                    <span>{player.web_name}</span>
                    <PlayerDetails player={player} />
                  </div>
                  <span className="top-list-score" title={stat.title}>
                    {stat.render(player)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  )
}

function PlayerDetails({ player }: { player: Player }) {
  return (
    <span className="top-list-details">
      {POSITION_SHORT_LABELS[player.element_type]} · £{(player.now_cost / 10).toFixed(1)}m
    </span>
  )
}
