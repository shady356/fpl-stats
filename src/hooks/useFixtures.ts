import { useEffect, useState } from 'react'

import { fetchFixtures } from '@/services/FplAPI'
import type { Fixture } from '@/types/fixture'

export function useFixtures() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchFixtures().then((data) => {
      if (!cancelled) {
        setFixtures(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { fixtures, loading }
}
