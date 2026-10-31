import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { AXIS_TICK, CHART_MARGIN } from './chartTypes.ts'

import './Chart.css'

export type LineSeries = {
  key: string
  name: string
  color: string
  /** Dashed, for a reference line such as an average. */
  dashed?: boolean
}

export type MultiLineDatum = {
  key: string | number
  /** x axis label, e.g. a gameweek number. */
  label: string
  /** Value by series key; a missing value leaves a gap. */
  values: Record<string, number>
  /** Tooltip heading. */
  title: string
}

type MultiLineChartProps = {
  data: MultiLineDatum[]
  series: LineSeries[]
  /** Describes the chart for screen readers. */
  'aria-label': string
  /** Formats y axis ticks and tooltip values. */
  formatValue?: (value: number) => string
  height?: number
}

/**
 * Line chart comparing several series, with a legend above and a shared tooltip on hover.
 * The y axis fits the data rather than starting at zero, so the gaps between lines stay visible.
 */
export default function MultiLineChart({
  data,
  series,
  'aria-label': ariaLabel,
  formatValue = String,
  height = 280,
}: MultiLineChartProps) {
  return (
    <div className="chart">
      <ul className="chart-legend">
        {series.map(({ key, name, color, dashed }) => (
          <li key={key}>
            <span
              className={`chart-legend-swatch${dashed ? ' chart-legend-swatch-dashed' : ''}`}
              style={{ color }}
            />
            {name}
          </li>
        ))}
      </ul>
      <div role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={40}
              domain={['auto', 'auto']}
              tickFormatter={formatValue}
            />
            <Tooltip
              content={(props) => (
                <MultiLineTooltip {...props} series={series} formatValue={formatValue} />
              )}
              cursor={{ stroke: 'var(--text-secondary-color)', strokeDasharray: '2 3' }}
              isAnimationActive={false}
            />
            {series.map(({ key, name, color, dashed }) => (
              <Line
                key={key}
                type="linear"
                name={name}
                dataKey={(datum: MultiLineDatum) => datum.values[key]}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={dashed ? '4 4' : undefined}
                dot={false}
                // Surface ring so the marker stands off overlapping lines.
                activeDot={{ r: 5, fill: color, stroke: 'var(--background-color)', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

type MultiLineTooltipProps = Pick<
  TooltipContentProps<ValueType, NameType>,
  'active' | 'payload'
> & {
  series: LineSeries[]
  formatValue: (value: number) => string
}

/**
 * The hovered gameweek's value for every series, highest first.
 */
function MultiLineTooltip({ active, payload, series, formatValue }: MultiLineTooltipProps) {
  const datum = payload?.[0]?.payload as MultiLineDatum | undefined
  if (!active || !datum) return null

  const rows = series
    .filter(({ key }) => datum.values[key] !== undefined)
    .toSorted((a, b) => datum.values[b.key] - datum.values[a.key])

  return (
    <div className="chart-tooltip" role="status">
      <span className="chart-tooltip-title">{datum.title}</span>
      {rows.map(({ key, name, color }) => (
        <span key={key} className="chart-tooltip-row">
          <span className="chart-legend-swatch" style={{ color }} />
          <span className="chart-tooltip-line">{name}</span>
          <span className="chart-tooltip-value">{formatValue(datum.values[key])}</span>
        </span>
      ))}
    </div>
  )
}
