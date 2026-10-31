import { Suspense, useState, useTransition } from 'react'

import BaseButton from '@/components/ui/BaseButton/BaseButton.tsx'
import BaseSegmentedButton from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButton'
import BaseSegmentedButtons from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButtons'
import BaseTab from '@/components/ui/BaseTabs/BaseTab'
import BaseTabs from '@/components/ui/BaseTabs/BaseTabs'
import Icon from '@/components/ui/Icon/Icon.tsx'
import { useBootstrap } from '@/hooks/useBootstrap'
import { useEntry, useEntryPicks, useLiveGameweek } from '@/hooks/useMyTeam'
import { buildLineup } from '@/utils/lineup.ts'

import './MyTeamPage.css'

import Pitch from './components/Pitch.tsx'
import Scoreboard from './components/Scoreboard.tsx'
import SeasonProgress, { type Manager } from './components/SeasonProgress.tsx'
import SeasonStatsPanel from './components/SeasonStatsPanel.tsx'

/** The managers' team ids from the FPL app, with their chart colors; the first is shown by default. */
const MANAGERS: Manager[] = [
  { teamId: 367026, color: 'var(--forward-color)' }, // Henrik
  { teamId: 2782976, color: 'var(--goalkeeper-color)' }, // Ibrar
  { teamId: 4776551, color: 'var(--midfielder-color)' }, // Andy
]

type MyTeamTab = 'teams' | 'progress'

const MY_TEAM_TABS: { tab: MyTeamTab; label: string }[] = [
  { tab: 'teams', label: 'Teams' },
  { tab: 'progress', label: 'Season progress' },
]

function MyTeamPage() {
  const [tab, setTab] = useState<MyTeamTab>('teams')
  const [teamId, setTeamId] = useState(MANAGERS[0].teamId)
  // Keep showing the current manager while the next one loads.
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <BaseTabs className="my-team-tabs" aria-label="Malemesterne view">
        {MY_TEAM_TABS.map(({ tab: value, label }) => (
          <BaseTab key={value} selected={tab === value} onClick={() => setTab(value)}>
            {label}
          </BaseTab>
        ))}
      </BaseTabs>

      {tab === 'teams' ? (
        <Suspense fallback={<p>Loading team…</p>}>
          <ManagerPicker
            selected={teamId}
            onSelect={(next) => startTransition(() => setTeamId(next))}
          />
          <div className={isPending ? 'my-team-pending' : undefined}>
            {/* Keyed so the gameweek resets to the new manager's current one. */}
            <MyTeam key={teamId} teamId={teamId} />
          </div>
        </Suspense>
      ) : (
        <Suspense fallback={<p>Loading season progress…</p>}>
          <SeasonProgress managers={MANAGERS} />
        </Suspense>
      )}
    </>
  )
}

type ManagerPickerProps = {
  selected: number
  onSelect: (teamId: number) => void
}

/**
 * One button per manager, labelled with their first name.
 */
function ManagerPicker({ selected, onSelect }: ManagerPickerProps) {
  return (
    <BaseSegmentedButtons aria-label="Manager" className="my-team-managers">
      {MANAGERS.map(({ teamId }) => (
        <BaseSegmentedButton
          key={teamId}
          selected={selected === teamId}
          onClick={() => onSelect(teamId)}
        >
          <ManagerName teamId={teamId} />
        </BaseSegmentedButton>
      ))}
    </BaseSegmentedButtons>
  )
}

function ManagerName({ teamId }: { teamId: number }) {
  const entry = useEntry(teamId)
  return entry?.player_first_name ?? `Team ${teamId}`
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
          <BaseButton
            aria-label="Previous gameweek"
            square
            disabled={gameweek <= 1}
            onClick={() => changeGameweek(gameweek - 1)}
          >
            <Icon icon="chevron_left" />
          </BaseButton>
          <h2>Gameweek {gameweek}</h2>
          <BaseButton
            aria-label="Next gameweek"
            square
            disabled={gameweek >= entry.current_event}
            onClick={() => changeGameweek(gameweek + 1)}
          >
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
