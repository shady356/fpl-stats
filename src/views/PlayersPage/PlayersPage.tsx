import { Suspense } from 'react'
import { useSearchParams } from 'react-router'

import BaseButton from '@/components/ui/BaseButton/BaseButton'
import BaseSegmentedButton from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButton'
import BaseSegmentedButtons from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButtons'
import type { SortOrder } from '@/components/ui/Table/TableHeaderCell'
import { usePlayers } from '@/hooks/usePlayers'
import type { PlayerPosition } from '@/types/player'
import type { Team } from '@/types/team'
import { filterPlayers } from '@/utils/playerFilters'
import { POSITION_SHORT_LABELS } from '@/utils/positions'

import './PlayersPage.css'

import PlayersTable from './components/PlayersTable'
import {
  defaultSortOrder,
  isPlayerColumnKey,
  sortPlayers,
  type PlayerColumnKey,
} from './playersTableColumns'

/** Rows shown at first, and added by each "Show more". */
const PAGE_SIZE = 50

const POSITIONS = [1, 2, 3, 4] as const

type PlayersPageProps = {
  teams: Team[]
}

function PlayersPage({ teams }: PlayersPageProps) {
  return (
    <div className="players-page">
      <Suspense fallback={<p>Loading players…</p>}>
        <PlayersList teams={teams} />
      </Suspense>
    </div>
  )
}

/**
 * Read a number from the URL, or undefined if it's missing or not one of the allowed values.
 */
function numberParam<T extends number>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((option) => String(option) === value)
}

function PlayersList({ teams }: PlayersPageProps) {
  const players = usePlayers()
  // Filters live in the URL so they survive opening a player and coming back.
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const position = numberParam<PlayerPosition>(params.get('position'), POSITIONS)
  const team = numberParam(
    params.get('team'),
    teams.map((team) => team.team_id),
  )
  const sortParam = params.get('sort')
  const sortKey: PlayerColumnKey = isPlayerColumnKey(sortParam) ? sortParam : 'total_points'
  const sortOrder: SortOrder = params.get('order') === 'asc' ? 'asc' : 'desc'
  const limit = Number(params.get('limit')) || PAGE_SIZE

  function update(changes: Record<string, string | undefined>) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(changes)) {
          if (value === undefined || value === '') next.delete(key)
          else next.set(key, value)
        }
        // A new filter or sort starts from the top again.
        if (!('limit' in changes)) next.delete('limit')
        return next
      },
      { replace: true },
    )
  }

  function sort(key: PlayerColumnKey) {
    if (key === sortKey) {
      update({ order: sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      update({ sort: key, order: defaultSortOrder(key) })
    }
  }

  if (players.length === 0) return <p>Could not load players.</p>

  const teamShortNames = new Map(teams.map((team) => [team.team_id, team.team_name_short]))
  const filtered = sortPlayers(
    filterPlayers(players, { search, position, team }),
    sortKey,
    sortOrder,
    teamShortNames,
  )

  return (
    <>
      <div className="players-filters">
        <h1>Players</h1>

        <input
          type="search"
          className="players-search"
          placeholder="Search players"
          aria-label="Search players"
          value={search}
          onChange={(e) => update({ q: e.target.value })}
        />

        <BaseSegmentedButtons aria-label="Position">
          <BaseSegmentedButton
            selected={position === undefined}
            onClick={() => update({ position: undefined })}
          >
            All
          </BaseSegmentedButton>
          {POSITIONS.map((value) => (
            <BaseSegmentedButton
              key={value}
              selected={position === value}
              onClick={() => update({ position: String(value) })}
            >
              {POSITION_SHORT_LABELS[value]}
            </BaseSegmentedButton>
          ))}
        </BaseSegmentedButtons>

        <select
          className="players-team"
          aria-label="Team"
          value={team ?? ''}
          onChange={(e) => update({ team: e.target.value })}
        >
          <option value="">All teams</option>
          {teams
            .toSorted((a, b) => a.team_name.localeCompare(b.team_name))
            .map((team) => (
              <option key={team.team_id} value={team.team_id}>
                {team.team_name}
              </option>
            ))}
        </select>

        <span className="players-count">
          {filtered.length} {filtered.length === 1 ? 'player' : 'players'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p>No players match.</p>
      ) : (
        <PlayersTable
          players={filtered.slice(0, limit)}
          teamShortNames={teamShortNames}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={sort}
        />
      )}

      {filtered.length > limit && (
        <BaseButton
          className="players-more"
          onClick={() => update({ limit: String(limit + PAGE_SIZE) })}
        >
          Show more
        </BaseButton>
      )}
    </>
  )
}

export default PlayersPage
