/**
 * Get the photo URL for a player.
 * @param code - Premier League player code, the `code` field in bootstrap-static.
 * @returns The 110x140 photo URL.
 */
export function playerPhotoUrl(code: number): string {
  return `https://resources.premierleague.com/premierleague25/photos/players/110x140/${code}.png`
}
