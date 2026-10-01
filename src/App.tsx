import './App.css'
import 'material-symbols/rounded.css'

import { Navigate, Route, Routes } from 'react-router'

import epl_2026_teams from '@data/epl_2026_teams.json'
import Header from '@/components/layout/Header.tsx'
import type { Team } from '@/types/team.ts'
import { computeTeamData } from '@/utils/computeTeamData.ts'
import Fixtures from '@/views/Fixtures/Fixtures.tsx'
import Overview from '@/views/Overview/Overview.tsx'
import TeamRoute from '@/views/TeamPage/TeamRoute'

const teams: Team[] = computeTeamData(epl_2026_teams)

function App() {
  return (
    <>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview teams={teams} />} />
          <Route path="/fixtures" element={<Fixtures teams={teams} />} />
          <Route path="/team/:teamId" element={<TeamRoute teams={teams} />} />
          <Route path="*" element={<p>Page not found</p>}></Route>
        </Routes>
      </main>
    </>
  )
}

export default App
