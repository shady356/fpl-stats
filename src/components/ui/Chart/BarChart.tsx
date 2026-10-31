import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import ChartTooltip from './ChartTooltip.tsx'
import { AXIS_TICK, CHART_MARGIN, type ChartDatum } from './chartTypes.ts'

import './Chart.css'

type BarChartProps = {
  data: ChartDatum[]
  /** Describes the chart for screen readers. */
  'aria-label': string
  height?: number
}

/**
 * Single-series bar chart with a zero baseline and a tooltip on hover.
 */
export default function BarChart({ data, 'aria-label': ariaLabel, height = 200 }: BarChartProps) {
  return (
    <div className="chart" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid vertical={false} stroke="var(--border-color)" />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={false}
          />
          <ReferenceLine y={0} stroke="var(--text-secondary-color)" />
          <Tooltip
            content={ChartTooltip}
            cursor={{ fill: 'var(--border-color)', opacity: 0.4 }}
            isAnimationActive={false}
          />
          <Bar
            dataKey="value"
            fill="var(--primary-color)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            isAnimationActive={false}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
