import { Navigate, Route, Routes } from 'react-router'

import epl_2026_matches from '@data/epl_2026_matches.json'
import Header from '@/components/layout/Header/Header'
import type { Team, TeamMatches } from '@/types/team.ts'
import { computeTeamData } from '@/utils/computeTeamData.ts'
import FixturesPage from '@/views/FixturesPage/FixturesPage.tsx'
import OverviewPage from '@/views/OverviewPage/OverviewPage.tsx'
import TeamRoute from '@/views/TeamPage/TeamRoute'

const teamMatches: TeamMatches[] = epl_2026_matches
const teams: Team[] = computeTeamData(teamMatches)

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage teamMatches={teamMatches} />} />
          <Route path="/fixtures" element={<FixturesPage teams={teams} />} />
          <Route path="/team/:teamId" element={<TeamRoute teams={teams} />} />
          <Route path="*" element={<p>Page not found</p>}></Route>
        </Routes>
      </main>
    </>
  )
}

export default App
