import { Suspense, use } from 'react'

import { fetchFixtures } from '@/services/FplAPI'
import type { Team } from '@/types/team.ts'

const fixturesPromise = fetchFixtures()

type FixtureProps = {
  teams: Team[]
}

function Fixtures({ teams }: FixtureProps) {
  return (
    <Suspense fallback={<p>Loading fixtures…</p>}>
      <FixtureList teams={teams} />
    </Suspense>
  )
}

function FixtureList({ teams }: FixtureProps) {
  const fixtures = use(fixturesPromise)

  return <pre>{JSON.stringify(fixtures, null, 2)}</pre>
}

export default Fixtures
