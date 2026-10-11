import { useState } from 'react'

import './OverviewPage.css'

import BaseSegmentedButton from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButton.tsx'
import BaseSegmentedButtons from '@/components/ui/BaseSegmentedButtons/BaseSegmentedButtons.tsx'
import type { TeamMatches } from '@/types/team.ts'
import type { MatchWindow } from '@/utils/aggregateMatches.ts'
import { computeTeamData } from '@/utils/computeTeamData.ts'

import TeamStatsTable from './components/TeamStatsTable.tsx'
import type { TeamRatingColor } from './components/TeamStatsTable.tsx'

type OverviewPageProps = {
  teamMatches: TeamMatches[]
}

function OverviewPage({ teamMatches }: OverviewPageProps) {
  const [teamRatingColor, setTeamRatingColor] = useState<TeamRatingColor>('none')
  const [matchWindow, setMatchWindow] = useState<MatchWindow>('all')
  const teams = computeTeamData(teamMatches, matchWindow)
  return (
    <div className="overview-page">
      <TableFilters
        teamRatingColor={teamRatingColor}
        setTeamRatingColor={setTeamRatingColor}
        matchWindow={matchWindow}
        setMatchWindow={setMatchWindow}
      />
      <TeamStatsTable teams={teams} teamRatingColor={teamRatingColor} />
    </div>
  )
}

const MATCH_WINDOW_OPTIONS: { value: MatchWindow; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 3, label: 'Last 3' },
  { value: 5, label: 'Last 5' },
  { value: 10, label: 'Last 10' },
]

type TableFiltersProps = {
  teamRatingColor: TeamRatingColor
  setTeamRatingColor: (color: TeamRatingColor) => void
  matchWindow: MatchWindow
  setMatchWindow: (window: MatchWindow) => void
}

function TableFilters({ setTeamRatingColor, matchWindow, setMatchWindow }: TableFiltersProps) {
  return (
    <div className="table-filters">
      <h1>Teams</h1>

      <BaseSegmentedButtons aria-labelledby="match-window-label">
        {MATCH_WINDOW_OPTIONS.map(({ value, label }) => (
          <BaseSegmentedButton
            key={value}
            selected={matchWindow === value}
            onClick={() => setMatchWindow(value)}
          >
            {label}
          </BaseSegmentedButton>
        ))}
      </BaseSegmentedButtons>

      <div className="table-filters-label">
        <select
          name="fdr-colors"
          id=""
          onChange={(e) => setTeamRatingColor(e.target.value as TeamRatingColor)}
        >
          <option value="none">No colors</option>
          <option value="total">Total</option>
          <option value="attack">Attack</option>
          <option value="defense">Defense</option>
        </select>
      </div>
    </div>
  )
}

export default OverviewPage
