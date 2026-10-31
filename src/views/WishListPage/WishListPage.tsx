import { Suspense, useState } from 'react'
import { Link } from 'react-router'

import type { SortOrder } from '@/components/ui/Table/TableHeaderCell'
import { useFavoritePlayers } from '@/hooks/useFavoritePlayers'
import { usePlayers } from '@/hooks/usePlayers'
import type { Team } from '@/types/team'
import PlayersTable from '@/views/PlayersPage/components/PlayersTable'
import {
  defaultSortOrder,
  sortPlayers,
  type PlayerColumnKey,
} from '@/views/PlayersPage/playersTableColumns'

import '@/views/PlayersPage/PlayersPage.css'
import './WishListPage.css'

type WishListPageProps = {
  teams: Team[]
}

function WishListPage({ teams }: WishListPageProps) {
  return (
    <div className="players-page">
      <h1 className="wish-list-title">Wish list</h1>
      <Suspense fallback={<p>Loading players…</p>}>
        <WishList teams={teams} />
      </Suspense>
    </div>
  )
}

function WishList({ teams }: WishListPageProps) {
  const players = usePlayers()
  const { favoriteIds } = useFavoritePlayers()
  const [sortKey, setSortKey] = useState<PlayerColumnKey>('total_points')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  function sort(key: PlayerColumnKey) {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder(defaultSortOrder(key))
    }
  }

  if (favoriteIds.length === 0) {
    return (
      <p className="wish-list-empty">
        No players yet. Press the heart next to a player on the <Link to="/players">Players</Link>{' '}
        page or a player's page to add them here.
      </p>
    )
  }

  if (players.length === 0) return <p>Could not load players.</p>

  const teamShortNames = new Map(teams.map((team) => [team.team_id, team.team_name_short]))
  const favorites = players.filter((player) => favoriteIds.includes(player.id))

  return (
    <PlayersTable
      players={sortPlayers(favorites, sortKey, sortOrder, teamShortNames)}
      teamShortNames={teamShortNames}
      sortKey={sortKey}
      sortOrder={sortOrder}
      onSort={sort}
    />
  )
}

export default WishListPage
