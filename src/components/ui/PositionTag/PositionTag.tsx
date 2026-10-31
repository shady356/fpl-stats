import type { PlayerPosition } from '@/types/player'
import { POSITION_SHORT_LABELS, positionColor } from '@/utils/positions'

import './PositionTag.css'

type PositionTagProps = {
  position: PlayerPosition
}

/**
 * Short position label, e.g. MID, on the position's color.
 */
export default function PositionTag({ position }: PositionTagProps) {
  return (
    <span className="position-tag" style={{ background: positionColor(position) }}>
      {POSITION_SHORT_LABELS[position]}
    </span>
  )
}
