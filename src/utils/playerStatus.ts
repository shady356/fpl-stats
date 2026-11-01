export type PlayerStatus = {
  /** Short label, e.g. "Injured". */
  label: string
  /** Material Symbols icon name. */
  icon: string
  /** CSS color: yellow when the player might play, red when they won't. */
  color: string
}

const STATUSES: Record<string, PlayerStatus> = {
  d: { label: 'Doubtful', icon: 'warning', color: 'var(--goalkeeper-color)' },
  i: { label: 'Injured', icon: 'medical_services', color: 'var(--forward-color)' },
  s: { label: 'Suspended', icon: 'block', color: 'var(--forward-color)' },
  u: { label: 'Unavailable', icon: 'do_not_disturb_on', color: 'var(--forward-color)' },
  n: { label: 'Ineligible', icon: 'person_off', color: 'var(--forward-color)' },
}

/**
 * Short label and color for a player's availability.
 * @param status - FPL's status code, e.g. "i".
 * @returns The status, or null when the player is available.
 */
export function playerStatus(status: string): PlayerStatus | null {
  return STATUSES[status] ?? null
}
