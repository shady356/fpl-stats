import './App.css'
import 'material-symbols/rounded.css'

import epl_2026_teams from '@data/epl_2026_teams.json'
import Header from '@/components/layout/Header.tsx'
import type { Team } from '@/types/team.ts'
import { computeTeamData } from '@/utils/computeTeamData.ts'
import Fixtures from '@/views/Fixtures/Fixtures.tsx'
import Overview from '@/views/Overview/Overview.tsx'

const teams: Team[] = computeTeamData(epl_2026_teams)

function App() {
  return (
    <>
      <Header />
      <main className="main">
        <Overview teams={teams} />
        <Fixtures />
      </main>
    </>
  )
}

export default App
