import { Suspense, useState, useTransition } from 'react'

import BaseButton from '@/components/ui/BaseButton/BaseButton.tsx'
import Icon from '@/components/ui/Icon/Icon.tsx'
import { useBootstrap } from '@/hooks/useBootstrap'
import { useEntry, useEntryPicks, useLiveGameweek } from '@/hooks/useMyTeam'
import { buildLineup } from '@/utils/lineup.ts'

import './MyTeamPage.css'

import Pitch from './components/Pitch.tsx'
import Scoreboard from './components/Scoreboard.tsx'
import SeasonStatsPanel from './components/SeasonStatsPanel.tsx'

/** The manager's team id from the FPL app. */
const MY_TEAM_ID = 367026

function MyTeamPage() {
  return (
    <Suspense fallback={<p>Loading team…</p>}>
      <MyTeam teamId={MY_TEAM_ID} />
    </Suspense>
  )
}

function MyTeam({ teamId }: { teamId: number }) {
  const entry = useEntry(teamId)
  const [gameweek, setGameweek] = useState(entry?.current_event ?? 1)
  // Keep showing the previous gameweek while the next one loads.
  const [isPending, startTransition] = useTransition()

  if (!entry) {
    return <p>Could not load team.</p>
  }

  const changeGameweek = (next: number) => startTransition(() => setGameweek(next))

  return (
    <div className="my-team-page">
      <div className="my-team-main">
        <h1>Points - {entry.name}</h1>
        <div className="my-team-gameweek">
          <BaseButton disabled={gameweek <= 1} onClick={() => changeGameweek(gameweek - 1)}>
            <Icon icon="chevron_left" />
            Previous
          </BaseButton>
          <h2>Gameweek {gameweek}</h2>
          <BaseButton
            disabled={gameweek >= entry.current_event}
            onClick={() => changeGameweek(gameweek + 1)}
          >
            Next
            <Icon icon="chevron_right" />
          </BaseButton>
        </div>
        <div className={isPending ? 'my-team-pending' : undefined}>
          <GameweekTeam teamId={teamId} gameweek={gameweek} />
        </div>
      </div>
      {/* Loads every gameweek of the season, so don't hold up the pitch while it does. */}
      <Suspense fallback={<p>Loading season stats…</p>}>
        <SeasonStatsPanel entry={entry} />
      </Suspense>
    </div>
  )
}

function GameweekTeam({ teamId, gameweek }: { teamId: number; gameweek: number }) {
  const bootstrap = useBootstrap()
  const entryPicks = useEntryPicks(teamId, gameweek)
  const live = useLiveGameweek(gameweek)

  if (!entryPicks) {
    return <p>No team for gameweek {gameweek}.</p>
  }

  const lineup = buildLineup(entryPicks, bootstrap?.players ?? [], live)
  const gameweekInfo = bootstrap?.gameweeks.find((event) => event.id === gameweek)

  return (
    <div className="my-team-content">
      <Scoreboard entryPicks={entryPicks} gameweek={gameweekInfo} />
      <Pitch lineup={lineup} />
    </div>
  )
}

export default MyTeamPage
