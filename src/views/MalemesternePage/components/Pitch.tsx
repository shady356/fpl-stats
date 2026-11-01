import type { Lineup, LineupPlayer } from '@/types/myTeam'
import type { PlayerPosition } from '@/types/player'

import './Pitch.css'

import PitchPlayer from './PitchPlayer.tsx'

const POSITION_SHORT_NAMES: Record<PlayerPosition, string> = {
  1: 'GKP',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
}

/**
 * Label a bench slot: the backup goalkeeper is first, then outfield subs in order, e.g. "1. DEF".
 */
function benchLabel({ pick }: LineupPlayer, index: number): string {
  const position = POSITION_SHORT_NAMES[pick.element_type]
  return index === 0 ? position : `${index}. ${position}`
}

/**
 * The starting XI in formation on a pitch, with the bench below.
 */
export default function Pitch({ lineup }: { lineup: Lineup }) {
  return (
    <section className="pitch-wrapper">
      <div className="pitch">
        {lineup.rows.map((row, i) => (
          <div key={i} className="pitch-row">
            {row.map((lineupPlayer) => (
              <PitchPlayer key={lineupPlayer.pick.element} lineupPlayer={lineupPlayer} />
            ))}
          </div>
        ))}
      </div>
      <div className="bench">
        <h2>Bench</h2>
        <div className="pitch-row">
          {lineup.bench.map((lineupPlayer, i) => (
            <div key={lineupPlayer.pick.element} className="bench-slot">
              <span className="bench-label">{benchLabel(lineupPlayer, i)}</span>
              <PitchPlayer lineupPlayer={lineupPlayer} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
