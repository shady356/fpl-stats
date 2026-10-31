import type { TooltipContentProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import type { ChartDatum } from './chartTypes.ts'

/**
 * Tooltip content for Recharts, showing the hovered datum's title and details.
 */
export default function ChartTooltip({
  active,
  payload,
}: Pick<TooltipContentProps<ValueType, NameType>, 'active' | 'payload'>) {
  const datum = payload?.[0]?.payload as ChartDatum | undefined
  if (!active || !datum) return null

  return (
    <div className="chart-tooltip" role="status">
      <span className="chart-tooltip-title">{datum.title}</span>
      {datum.details?.map((line) => (
        <span key={line} className="chart-tooltip-line">
          {line}
        </span>
      ))}
    </div>
  )
}
