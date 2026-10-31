import { Suspense } from 'react'
import { useParams } from 'react-router'

import { usePlayers } from '@/hooks/usePlayers'
import type { Team } from '@/types/team'

import PlayerPage from './PlayerPage'

type PlayerRouteProps = {
  teams: Team[]
}

function PlayerRoute({ teams }: PlayerRouteProps) {
  return (
    <Suspense fallback={<p>Loading player…</p>}>
      <PlayerLookup teams={teams} />
    </Suspense>
  )
}

function PlayerLookup({ teams }: PlayerRouteProps) {
  const { playerId } = useParams()
  const player = usePlayers().find((player) => player.id === Number(playerId))

  if (!player) return <p>Player not found</p>

  // Keyed so hover state and the like reset when navigating between players.
  return <PlayerPage key={player.id} player={player} teams={teams} />
}

export default PlayerRoute
