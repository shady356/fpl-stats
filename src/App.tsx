import { Navigate, Route, Routes } from 'react-router'

import epl_2026_matches from '@data/epl_2026_matches.json'
import Header from '@/components/layout/Header/Header'
import type { Team, TeamMatches } from '@/types/team.ts'
import { computeTeamData } from '@/utils/computeTeamData.ts'
import FixturesPage from '@/views/FixturesPage/FixturesPage.tsx'
import MyTeamPage from '@/views/MyTeamPage/MyTeamPage.tsx'
import OverviewPage from '@/views/OverviewPage/OverviewPage.tsx'
import PlayerRoute from '@/views/PlayerPage/PlayerRoute'
import PlayersPage from '@/views/PlayersPage/PlayersPage.tsx'
import TeamRoute from '@/views/TeamPage/TeamRoute'
import TeamsPage from '@/views/TeamsPage/TeamsPage.tsx'
import WishListPage from '@/views/WishListPage/WishListPage.tsx'

const teamMatches: TeamMatches[] = epl_2026_matches
const teams: Team[] = computeTeamData(teamMatches)

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage teams={teams} />} />
          <Route path="/teams" element={<TeamsPage teamMatches={teamMatches} />} />
          <Route path="/players" element={<PlayersPage teams={teams} />} />
          <Route path="/fixtures" element={<FixturesPage teams={teams} />} />
          <Route path="/my-team" element={<MyTeamPage />} />
          <Route path="/wish-list" element={<WishListPage teams={teams} />} />
          <Route path="/team/:teamId" element={<TeamRoute teams={teams} />} />
          <Route path="/player/:playerId" element={<PlayerRoute teams={teams} />} />
          <Route path="*" element={<p>Page not found</p>}></Route>
        </Routes>
      </main>
    </>
  )
}

export default App
