import MultiLineChart, { type LineSeries } from '@/components/ui/Chart/MultiLineChart'
import { useBootstrap } from '@/hooks/useBootstrap'
import { useManagerSeasons } from '@/hooks/useMyTeam'
import type { EntryHistory } from '@/types/myTeam'
import { AVERAGE_KEY, seasonProgress } from '@/utils/seasonProgress.ts'

import './SeasonProgress.css'

export type Manager = {
  teamId: number
  color: string
}

const AVERAGE_SERIES: LineSeries = {
  key: AVERAGE_KEY,
  name: 'Average',
  color: 'var(--defender-color)',
  dashed: true,
}

/**
 * Each manager's total points per gameweek this season, against the accumulated average.
 */
export default function SeasonProgress({ managers }: { managers: Manager[] }) {
  const bootstrap = useBootstrap()
  const seasons = useManagerSeasons(managers.map(({ teamId }) => teamId))
  const histories: Record<string, EntryHistory> = {}
  const series: LineSeries[] = []
  seasons.forEach(({ teamId, entry, history }, index) => {
    if (!history) return
    histories[teamId] = history
    series.push({
      key: String(teamId),
      name: entry?.player_first_name ?? `Team ${teamId}`,
      color: managers[index].color,
    })
  })

  const rows = seasonProgress(histories, bootstrap?.gameweeks ?? [])
  if (rows.length === 0) return null

  return (
    <section className="season-progress">
      <h2>Season progress</h2>
      <MultiLineChart
        aria-label="Total points per gameweek for each manager and the average"
        height={480}
        series={[...series, AVERAGE_SERIES]}
        data={rows.map(({ gameweek, values }) => ({
          key: gameweek,
          label: String(gameweek),
          values,
          title: `GW ${gameweek}`,
        }))}
      />
    </section>
  )
}
