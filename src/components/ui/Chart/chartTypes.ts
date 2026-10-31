/**
 * One point in a single-series chart.
 */
export type ChartDatum = {
  key: string | number
  /** x axis label, e.g. a gameweek number. */
  label: string
  value: number
  /** Tooltip heading. */
  title: string
  /** Extra tooltip lines. */
  details?: string[]
}

/** Shared axis tick styling, themed through CSS variables. */
export const AXIS_TICK = { fontSize: 11, fill: 'var(--text-secondary-color)' }
export const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: 0 }
