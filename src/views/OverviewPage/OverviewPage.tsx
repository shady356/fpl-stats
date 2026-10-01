import { useState } from 'react'

import './OverviewPage.css'

import type { Team } from '@/types/team.ts'

import TeamStatsTable from './components/TeamStatsTable.tsx'
import type { TeamRatingColor } from './components/TeamStatsTable.tsx'

type OverviewPageProps = {
  teams: Team[]
}

function OverviewPage({ teams }: OverviewPageProps) {
  const [teamRatingColor, setTeamRatingColor] = useState<TeamRatingColor>('none')
  return (
    <div className="overview-page">
      <TableFilters setTeamRatingColor={setTeamRatingColor} />
      <TeamStatsTable teams={teams} teamRatingColor={teamRatingColor} />
    </div>
  )
}

type TableFiltersProps = {
  setTeamRatingColor: (color: TeamRatingColor) => void
}

function TableFilters({ setTeamRatingColor }: TableFiltersProps) {
  return (
    <div className="table-filters">
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
