/** Form (points per game over the last 30 days) from which a player is in good form. */
export const GOOD_FORM = 5

/** Form below which a player is in poor form. */
export const POOR_FORM = 3

/**
 * Color that grades a player's form: red when poor, yellow when middling, green when good,
 * and gray at 0 when there's nothing to grade.
 * @param form - The player's form, e.g. 4.3.
 * @returns A CSS color value.
 */
export function formColor(form: number): string {
  if (form === 0) return 'var(--text-secondary-color)'
  if (form >= GOOD_FORM) return 'var(--defender-color)'
  if (form >= POOR_FORM) return 'var(--goalkeeper-color)'
  return 'var(--forward-color)'
}
