import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import ChartTooltip from './ChartTooltip.tsx'
import { AXIS_TICK, CHART_MARGIN, type ChartDatum } from './chartTypes.ts'

import './Chart.css'

type LineChartProps = {
  data: ChartDatum[]
  /** Describes the chart for screen readers. */
  'aria-label': string
  /** Formats y axis ticks. */
  formatTick?: (value: number) => string
  height?: number
}

/** Surface ring so the marker stands off the line. */
const MARKER = {
  r: 5,
  fill: 'var(--primary-color)',
  stroke: 'var(--background-color)',
  strokeWidth: 2,
}

/**
 * Single-series line chart with a crosshair and tooltip on hover.
 * The y axis fits the data rather than starting at zero, so small changes stay visible.
 */
export default function LineChart({
  data,
  'aria-label': ariaLabel,
  formatTick = String,
  height = 200,
}: LineChartProps) {
  const lastIndex = data.length - 1

  return (
    <div className="chart" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid vertical={false} stroke="var(--border-color)" />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={36}
            domain={['auto', 'auto']}
            tickFormatter={formatTick}
          />
          <Tooltip
            content={ChartTooltip}
            cursor={{ stroke: 'var(--text-secondary-color)', strokeDasharray: '2 3' }}
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="value"
            stroke="var(--primary-color)"
            strokeWidth={2}
            // The latest point is always marked; the hovered one via activeDot.
            dot={({ index, cx, cy }) =>
              index === lastIndex ? (
                <circle key={index} cx={cx} cy={cy} {...MARKER} />
              ) : (
                <g key={index} />
              )
            }
            activeDot={MARKER}
            isAnimationActive={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
