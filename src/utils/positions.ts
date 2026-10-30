import type { PlayerPosition } from '@/types/player'

const POSITION_COLORS: Record<PlayerPosition, string> = {
  1: 'var(--goalkeeper-color)',
  2: 'var(--defender-color)',
  3: 'var(--midfielder-color)',
  4: 'var(--forward-color)',
}

/**
 * Get the color that marks a position.
 * @param position - FPL position.
 * @returns A CSS color value.
 */
export function positionColor(position: PlayerPosition): string {
  return POSITION_COLORS[position]
}

/**
 * Short label for each position, e.g. MID.
 */
export const POSITION_SHORT_LABELS: Record<PlayerPosition, string> = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
}
