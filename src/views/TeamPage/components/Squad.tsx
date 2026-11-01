import { useState } from 'react'

import BaseSegmentedButton from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButton'
import BaseSegmentedButtons from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButtons'
import type { SortOrder } from '@/components/ui/Table/TableHeaderCell'
import { usePlayers } from '@/hooks/usePlayers'
import type { Player, PlayerPosition } from '@/types/player'
import type { Team } from '@/types/team'
import { filterPlayers } from '@/utils/playerFilters'
import { POSITION_SHORT_LABELS } from '@/utils/positions'
import CompareToggle from '@/views/PlayersPage/components/CompareToggle'
import PlayersTable from '@/views/PlayersPage/components/PlayersTable'
import {
  DEFAULT_SORT_KEY,
  defaultSortOrder,
  sortPlayers,
  type PlayerColumnKey,
} from '@/views/PlayersPage/playersTableColumns'

import '@/views/PlayersPage/PlayersPage.css'
import './Squad.css'

const POSITIONS = [1, 2, 3, 4] as const

/**
 * The team's players, in the same table as the Players page.
 */
export default function Squad({ team }: { team: Team }) {
  const players = usePlayers()
  const [position, setPosition] = useState<PlayerPosition>()
  const [comparing, setComparing] = useState(false)
  // The position filter from before picking a player switched it to theirs; null when it wasn't switched.
  const [positionBeforePick, setPositionBeforePick] = useState<{
    value?: PlayerPosition
  } | null>(null)
  const [sortKey, setSortKey] = useState<PlayerColumnKey>(DEFAULT_SORT_KEY)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  function sort(key: PlayerColumnKey) {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder(defaultSortOrder(key))
    }
  }

  /** Only players in the same position can be compared, so the first pick filters on theirs. */
  function changePicked(picked: Player[]) {
    if (picked.length > 0 && positionBeforePick === null) {
      setPositionBeforePick({ value: position })
      setPosition(picked[0].element_type)
    } else if (picked.length === 0) {
      restorePosition()
    }
  }

  function restorePosition() {
    if (positionBeforePick === null) return
    setPosition(positionBeforePick.value)
    setPositionBeforePick(null)
  }

  function stopComparing() {
    setComparing(false)
    restorePosition()
  }

  const teamNames = new Map([[team.team_id, team.team_name]])
  const filtered = sortPlayers(
    filterPlayers(players, { search: '', position, team: team.team_id }),
    sortKey,
    sortOrder,
  )

  return (
    <section className="card squad">
      <div className="card-header">
        <h2>Players</h2>

        <div className="squad-filters">
          <BaseSegmentedButtons aria-label="Position">
            <BaseSegmentedButton
              selected={position === undefined}
              onClick={() => setPosition(undefined)}
            >
              All
            </BaseSegmentedButton>
            {POSITIONS.map((value) => (
              <BaseSegmentedButton
                key={value}
                selected={position === value}
                onClick={() => setPosition(value)}
              >
                {POSITION_SHORT_LABELS[value]}
              </BaseSegmentedButton>
            ))}
          </BaseSegmentedButtons>

          <CompareToggle
            comparing={comparing}
            onToggle={() => (comparing ? stopComparing() : setComparing(true))}
          />
        </div>
      </div>

      {players.length === 0 ? (
        <p>Could not load players.</p>
      ) : (
        <PlayersTable
          players={filtered}
          teamNames={teamNames}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={sort}
          comparing={comparing}
          onStopComparing={stopComparing}
          onPickedChange={changePicked}
        />
      )}
    </section>
  )
}
