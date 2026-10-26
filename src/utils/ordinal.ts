/**
 * Format a number as an English ordinal.
 * @param value - A positive integer, e.g. a league position.
 * @returns The number with its suffix, e.g. 1st, 2nd, 3rd, 4th, 11th, 21st.
 */
export function ordinal(value: number): string {
  const lastTwo = value % 100
  if (lastTwo >= 11 && lastTwo <= 13) return `${value}th`
  switch (value % 10) {
    case 1:
      return `${value}st`
    case 2:
      return `${value}nd`
    case 3:
      return `${value}rd`
    default:
      return `${value}th`
  }
}
