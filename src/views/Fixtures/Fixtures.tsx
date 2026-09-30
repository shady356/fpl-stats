import { useFixtures } from '@/hooks/useFixtures'

function Fixtures() {
  const { fixtures, loading } = useFixtures()

  if (loading) return <p>Loading fixtures…</p>

  return <pre>{JSON.stringify(fixtures, null, 2)}</pre>
}

export default Fixtures
