import { Suspense, use } from 'react'

import { fetchFixtures } from '@/services/FplAPI'

const fixturesPromise = fetchFixtures()

function FixtureList() {
  const fixtures = use(fixturesPromise)

  return <pre>{JSON.stringify(fixtures, null, 2)}</pre>
}

function Fixtures() {
  return (
    <Suspense fallback={<p>Loading fixtures…</p>}>
      <FixtureList />
    </Suspense>
  )
}

export default Fixtures
