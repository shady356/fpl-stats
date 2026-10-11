/**
 * Round a number to a fixed number of decimals, keeping it a number (use toFixed or Intl for display).
 * @param value - The number to round.
 * @param decimals - Decimal places to keep; defaults to 2.
 * @returns The rounded number.
 */
export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
