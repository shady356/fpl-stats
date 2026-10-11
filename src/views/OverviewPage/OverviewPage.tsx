import { useState } from 'react'

import './OverviewPage.css'

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
      <TableFilters setTeamRatingColor={setTeamRatingColor} setMatchWindow={setMatchWindow} />
      <TeamStatsTable teams={teams} teamRatingColor={teamRatingColor} />
    </div>
  )
}

type TableFiltersProps = {
  setTeamRatingColor: (color: TeamRatingColor) => void
  setMatchWindow: (window: MatchWindow) => void
}

function TableFilters({ setTeamRatingColor, setMatchWindow }: TableFiltersProps) {
  return (
    <div className="table-filters">
      <label className="table-filters-label">
        Matches
        <select
          name="match-window"
          defaultValue="all"
          onChange={(e) =>
            setMatchWindow(
              e.target.value === 'all' ? 'all' : (Number(e.target.value) as MatchWindow),
            )
          }
        >
          <option value="all">All</option>
          <option value="3">Last 3</option>
          <option value="5">Last 5</option>
          <option value="10">Last 10</option>
        </select>
      </label>
      <label className="table-filters-label">
        FDR colors
        <select
          name="fdr-colors"
          id=""
          onChange={(e) => setTeamRatingColor(e.target.value as TeamRatingColor)}
        >
          <option value="none">None</option>
          <option value="total">Total</option>
          <option value="attack">Attack</option>
          <option value="defense">Defense</option>
        </select>
      </label>
    </div>
  )
}

export default OverviewPage
