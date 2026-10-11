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

const TEAM_RATING_COLOR_OPTIONS: { value: TeamRatingColor; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'total', label: 'Total' },
  { value: 'attack', label: 'Attack' },
  { value: 'defense', label: 'Defense' },
]

type TableFiltersProps = {
  teamRatingColor: TeamRatingColor
  setTeamRatingColor: (color: TeamRatingColor) => void
  matchWindow: MatchWindow
  setMatchWindow: (window: MatchWindow) => void
}

function TableFilters({
  teamRatingColor,
  setTeamRatingColor,
  matchWindow,
  setMatchWindow,
}: TableFiltersProps) {
  return (
    <div className="table-filters">
      <div className="table-filters-label">
        <span id="match-window-label">Matches</span>
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
      </div>
      <div className="table-filters-label">
        <span id="fdr-colors-label">FDR colors</span>
        <BaseSegmentedButtons aria-labelledby="fdr-colors-label">
          {TEAM_RATING_COLOR_OPTIONS.map(({ value, label }) => (
            <BaseSegmentedButton
              key={value}
              selected={teamRatingColor === value}
              onClick={() => setTeamRatingColor(value)}
            >
              {label}
            </BaseSegmentedButton>
          ))}
        </BaseSegmentedButtons>
      </div>
    </div>
  )
}

export default OverviewPage
